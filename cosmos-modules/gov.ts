import type { QueryVotesRequest } from "moonkittjs/dist/codegen/cosmos/gov/v1/query"

import { getRpcClient, getAllWithPagination } from "../utils/client"

export const getAllVotes = async (proposalId: number) => {
  const client = await getRpcClient()

  const allVotesParams: QueryVotesRequest = {
    proposalId: BigInt(proposalId),
  }

  const allVotesFn = await getAllWithPagination(client.cosmos.gov.v1.votes, "votes")

  return await allVotesFn(allVotesParams)
}
