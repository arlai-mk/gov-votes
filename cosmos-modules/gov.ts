import type { QueryVotesRequest } from "moonkittjs/dist/codegen/cosmos/gov/v1/query"
import { VoteOption } from "moonkittjs/dist/codegen/cosmos/gov/v1/gov"

import { getRpcClient, getAllWithPagination } from "../utils/client"

export const getAllVotes = async (proposalId: number) => {
  const client = await getRpcClient()

  const allVotesParams: QueryVotesRequest = {
    proposalId: BigInt(proposalId),
  }

  const allVotesFn = await getAllWithPagination(client.cosmos.gov.v1.votes, "votes")

  return await allVotesFn(allVotesParams)
}

export const displayVoteOption = (option: VoteOption): string => {
  if (option == VoteOption.VOTE_OPTION_ABSTAIN) {
    return "ABSTAIN"
  } else if (option == VoteOption.VOTE_OPTION_YES) {
    return "YES"
  } else if (option == VoteOption.VOTE_OPTION_NO) {
    return "NO"
  } else if (option == VoteOption.VOTE_OPTION_NO_WITH_VETO) {
    return "NWV"
  }
  return "UNDEFINED"
}
