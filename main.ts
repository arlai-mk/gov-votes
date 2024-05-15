import { getAllDelegations } from "./cosmos-modules/staking"

const runAll = async (): Promise<void> => {
  const cosmosAddress = "cosmos1yy6lv2fr7lg7mktl04pyz9y5g6yevgl95yffnj"

  const delegations = await getAllDelegations(cosmosAddress)

  console.log(delegations)
}

runAll()
