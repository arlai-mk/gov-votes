import type { QueryDelegatorDelegationsRequest } from "moonkittjs/dist/codegen/cosmos/staking/v1beta1/query"
import { getRpcClient, getAllWithPagination } from "../utils/client"

export const getAllDelegations = async (address: string) => {
  const client = await getRpcClient()

  const allDelegationsParams: QueryDelegatorDelegationsRequest = {
    delegatorAddr: address,
  }
  const allDelegationsFn = await getAllWithPagination(
    client.cosmos.staking.v1beta1.delegatorDelegations,
    "delegationResponses"
  )

  return await allDelegationsFn(allDelegationsParams)
}
