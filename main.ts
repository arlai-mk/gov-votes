import { getAllDelegations } from "./cosmos-modules/staking"
import { getAllVotes } from "./cosmos-modules/gov"

const runAll = async (): Promise<void> => {
  const votes = await getAllVotes(922)

  console.log(votes)
}

runAll()
