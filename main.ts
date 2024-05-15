import { getAllDelegations } from "./cosmos-modules/staking"
import { getAllVotes, displayVoteOption } from "./cosmos-modules/gov"

const runAll = async (): Promise<void> => {
  const ids = [920, 921, 922]

  const result = await Promise.all(ids.map((id) => displayVotesForProp(id)))

  console.error(result)
}

const displayVotesForProp = async (id: number, limit?: number): Promise<string> => {
  const votes = await getAllVotes(id)

  let counter = 1
  for (const vote of votes) {
    const delegations = await getAllDelegations(vote.voter)

    let total = 0
    for (const delegation of delegations) {
      total += +delegation.balance.amount
    }

    for (const option of vote.options) {
      console.log(
        id +
          "|" +
          vote.voter +
          "|" +
          (total * +option.weight) / 1000000 +
          "|" +
          displayVoteOption(option.option)
      )
    }

    counter++
    if (limit && counter > limit) {
      break
    }
  }

  return "Prop " + id + ": " + votes.length + " votes"
}

runAll()
