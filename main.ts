import { getVoterDelegations, getAllValidators, getAllValDelegations } from "./cosmos-modules/staking"
import { getAllVotes, displayVoteOption } from "./cosmos-modules/gov"

import { BondStatus, type Validator } from "moonkittjs/dist/codegen/cosmos/staking/v1beta1/staking"

interface ValidatorByValoper {
  [key: string]: Validator
}

interface DelegationsByDelegator {
  [key: string]: {
    valoper: string
    moniker: string
    amount: string
  }[]
}

// We use this as CSV separator as we need a character not used in monikers
const CSV_SEPARATOR = "`"

// For some reason, "fast" crashes my RPC server.
// It should be able to work, so just leaving it here (though untested yet).
const runAll = async (type: "fast" | "slow"): Promise<void> => {
  const ids = [920, 921, 922]

  let result: string[] = [""]

  if (type === "fast") {
    const validators = await getAllValidators()
    const delegationsByDelegator = await getAllDelegationsByDelegator(validators)
    result = await Promise.all(ids.map((id) => displayVotesForPropFast(id, delegationsByDelegator)))
  } else if (type === "slow") {
    const validatorsByValoper = await getAllValidatorsByValoper()
    displayCSVHeaderSlow(true)
    result = await Promise.all(ids.map((id) => displayVotesForPropSlow(id, undefined, validatorsByValoper)))
  }

  console.log(result)
}

const displayCSVHeaderSlow = async (splitByValidator: boolean) => {
  if (splitByValidator) {
    console.error(
      "Prop ID" +
        CSV_SEPARATOR +
        "Delegator" +
        CSV_SEPARATOR +
        "Validator address" +
        CSV_SEPARATOR +
        "Validator moniker" +
        CSV_SEPARATOR +
        "Delegated VP" +
        CSV_SEPARATOR +
        "Status" +
        CSV_SEPARATOR +
        "Voting Power" +
        CSV_SEPARATOR +
        "Voting Option" +
        CSV_SEPARATOR +
        "Is Self Bond?"
    )
  }
}

// If you want to show the detail of each vote "per delegator / validator pair"
// (i.e. not aggregate all delegations to one row)
// Then please add the validatorsByValoper
const displayVotesForPropSlow = async (
  id: number,
  limit?: number,
  validatorsByValoper?: ValidatorByValoper
): Promise<string> => {
  const votes = await getAllVotes(id)

  let counter = 1
  for (const vote of votes) {
    const delegations = await getVoterDelegations(vote.voter)

    // We want to detail each vote "per delegator / validator pair"
    if (validatorsByValoper) {
      for (const delegation of delegations) {
        if (!(delegation.delegation.validatorAddress in validatorsByValoper)) {
          console.log("Error: Cannot find validator: " + delegation.delegation.validatorAddress)
          continue
        }

        for (const option of vote.options) {
          if (+option.weight < 1) {
            console.log("Weighted vote: " + vote.voter + ". Weight: " + option.weight)
          }
          console.error(
            id +
              CSV_SEPARATOR +
              vote.voter +
              CSV_SEPARATOR +
              delegation.delegation.validatorAddress +
              CSV_SEPARATOR +
              validatorsByValoper[delegation.delegation.validatorAddress].description.moniker +
              CSV_SEPARATOR +
              (+validatorsByValoper[delegation.delegation.validatorAddress].tokens * +option.weight) /
                1000000 +
              CSV_SEPARATOR +
              (validatorsByValoper[delegation.delegation.validatorAddress].status ==
              BondStatus.BOND_STATUS_BONDED
                ? "Active"
                : "Inactive") +
              CSV_SEPARATOR +
              (+delegation.balance.amount * +option.weight) / 1000000 +
              CSV_SEPARATOR +
              displayVoteOption(option.option) +
              CSV_SEPARATOR +
              (vote.voter.substring(7, 7 + 32) ===
              delegation.delegation.validatorAddress.substring(14, 14 + 32)
                ? "Yes"
                : "No")
          )
        }
      }
    } else {
      let total = 0
      for (const delegation of delegations) {
        total += +delegation.balance.amount
      }

      for (const option of vote.options) {
        console.error(
          id +
            CSV_SEPARATOR +
            vote.voter +
            CSV_SEPARATOR +
            (total * +option.weight) / 1000000 +
            CSV_SEPARATOR +
            displayVoteOption(option.option)
        )
      }
    }

    counter++
    if (limit && counter > limit) {
      break
    }
  }

  return "Prop " + id + ": " + votes.length + " votes"
}

const getAllDelegationsByDelegator = async (validators: Validator[]): Promise<DelegationsByDelegator> => {
  const delegationsByDelegator: DelegationsByDelegator = {}

  for (const validator of validators) {
    const validatorDelegations = await getAllValDelegations(validator.operatorAddress)
    for (const delegation of validatorDelegations) {
      delegationsByDelegator[delegation.delegation.delegatorAddress].push({
        valoper: validator.operatorAddress,
        moniker: validator.description.moniker,
        amount: delegation.balance.amount,
      })
    }
  }

  return delegationsByDelegator
}

const getAllValidatorsByValoper = async (): Promise<ValidatorByValoper> => {
  const validatorsByValoper: ValidatorByValoper = {}
  const validators = await getAllValidators()

  for (const validator of validators) {
    validatorsByValoper[validator.operatorAddress] = validator
  }

  return validatorsByValoper
}

const displayVotesForPropFast = async (
  id: number,
  delegationsByDelegator: DelegationsByDelegator,
  limit?: number,
  valAddress?: string
): Promise<string> => {
  const votes = await getAllVotes(id)

  let counter = 1
  for (const vote of votes) {
    if (!(vote.voter in delegationsByDelegator)) {
      console.log("Error: cannot find delegation of voter: " + vote.voter)
      continue
    }

    const delegations = delegationsByDelegator[vote.voter]

    let total = 0
    for (const delegation of delegations) {
      if (!valAddress || delegation.valoper == valAddress) {
        total += +delegation.amount
      }
    }

    for (const option of vote.options) {
      if (total > 0) {
        console.error(
          id +
            CSV_SEPARATOR +
            vote.voter +
            CSV_SEPARATOR +
            (total * +option.weight) / 1000000 +
            CSV_SEPARATOR +
            displayVoteOption(option.option)
        )
      }
    }

    counter++
    if (limit && counter > limit) {
      break
    }
  }

  return "Prop " + id + ": " + votes.length + " votes"
}

runAll("slow")
