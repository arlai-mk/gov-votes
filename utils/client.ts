import type { PageRequest, PageResponse } from "moonkittjs/dist/codegen/cosmos/base/query/v1beta1/pagination"

const RPC_URL = "ENTER_RPC_HERE"

export const getRpcClient = async () => {
  const cosmos = (await import("moonkittjs")).cosmos
  return await cosmos.ClientFactory.createRPCQueryClient({ rpcEndpoint: RPC_URL })
}

/*
  We want a generic function to iterate over pages
  when we run Cosmos queries.
  As example, ReturnType may be Coin or DelegationResponse
  FetchResponse: {
    pagination?: PageResponse
    balances: Coin[]
  }
*/
interface PaginateRequest {
  pagination?: PageRequest
}

type PaginateResponsePartial = {
  pagination?: PageResponse
}

// For now, we have to manually add any property
// that we may want to retrieve
// TODO: Find a way to make it more generic
type Fetch<ReturnType> = {
  balances?: ReturnType[]
  delegationResponses?: ReturnType[]
  validators?: ReturnType[]
  unbondingResponses?: ReturnType[]
  votes?: ReturnType[]
}

type FetchResponse<ReturnType> = PaginateResponsePartial & Fetch<ReturnType>

export const getAllWithPagination =
  <FetchRequest extends PaginateRequest, ReturnType>(
    theAsyncMethod: (request: FetchRequest) => Promise<FetchResponse<ReturnType>>,
    key: keyof Fetch<ReturnType>
  ) =>
  async (request: FetchRequest): Promise<ReturnType[]> => {
    const allResults: ReturnType[] = []

    try {
      let startAtKey: Uint8Array = new Uint8Array()

      do {
        request.pagination = {
          key: startAtKey,
          offset: BigInt(0),
          limit: BigInt(100),
          countTotal: true,
          reverse: false,
        }
        const { [key]: result, pagination }: FetchResponse<ReturnType> = await theAsyncMethod(request)

        const loadedResults = result || []

        allResults.unshift(...loadedResults)
        startAtKey = pagination!.nextKey!
      } while (startAtKey.length > 0)
    } catch (_e: any) {
      throw new Error(_e)
    }

    return allResults
  }
