const RPC_URL = "https://rpc-cosmoshub.moonkitt.com"
const cosmosAddress = "cosmos1yy6lv2fr7lg7mktl04pyz9y5g6yevgl95yffnj"

const runAll = async (): Promise<void> => {
    const { createRPCQueryClient } = (await import("moonkittjs")).cosmos.ClientFactory

    const client = await createRPCQueryClient({ rpcEndpoint: RPC_URL })

    // now you can query the cosmos modules
    const balance = await client.cosmos.bank.v1beta1.allBalances({
        address: cosmosAddress,
    })

    console.log(balance)
}

runAll()
