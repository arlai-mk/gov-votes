import type {
  QueryDelegatorDelegationsRequest,
  QueryValidatorDelegationsRequest,
  QueryValidatorsRequest,
} from "moonkittjs/dist/codegen/cosmos/staking/v1beta1/query"
import { getRpcClient, getAllWithPagination } from "../utils/client"

export const getVoterDelegations = async (address: string) => {
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

export const getAllValDelegations = async (valAddress: string) => {
  const client = await getRpcClient()

  const allValidatorDelegationsParams: QueryValidatorDelegationsRequest = {
    validatorAddr: valAddress,
  }
  const allValidatorDelegationsFn = await getAllWithPagination(
    client.cosmos.staking.v1beta1.validatorDelegations,
    "delegationResponses"
  )

  return await allValidatorDelegationsFn(allValidatorDelegationsParams)
}

export const getAllValidators = async () => {
  const client = await getRpcClient()

  const allValidatorsBondedParams: QueryValidatorsRequest = {
    status: "BOND_STATUS_BONDED",
  }
  const allValidatorsUnbondedParams: QueryValidatorsRequest = {
    status: "BOND_STATUS_UNBONDED",
  }
  const allValidatorsUnbondingParams: QueryValidatorsRequest = {
    status: "BOND_STATUS_UNBONDING",
  }

  const allValidatorsFn = await getAllWithPagination(client.cosmos.staking.v1beta1.validators, "validators")

  const result = await Promise.all(
    [allValidatorsBondedParams, allValidatorsUnbondedParams, allValidatorsUnbondingParams].map((type) =>
      allValidatorsFn(type)
    )
  )

  return result.flat()
}
