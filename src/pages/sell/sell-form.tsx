import React, {useContext, useState} from "react"
import { useForm } from "react-hook-form"
import {Box, Card, Stack} from "@mui/material"
import { PrepareOrderResponse } from "@rarible/sdk/build/types/order/common"
import {toBigNumber, toItemId} from "@rarible/types"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"
import { getCurrency } from "../../common/get-currency"

interface ISellFormProps {
	onComplete: (response: any) => void
	prepare: PrepareOrderResponse
	disabled?: boolean
}

export function SellForm({ prepare, disabled, onComplete }: ISellFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()
	const [ itemInfo, setItemInfo ] = useState("{}")
	const [ progressText, setProgressText ] = useState("Not Started")

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				try {
					const itemId = localStorage.getItem('itemId')
					const response = await connection.sdk.apis.item.getItemById({
						itemId: itemId??""
					}) || {}
					console.log(JSON.stringify(response))
					setItemInfo(JSON.stringify(response))

					// @ts-ignore
					const imageId = response['meta']['name']
					// @ts-ignore
					const metadataUri = response['meta']['originalMetaUri']

					setProgressText("Fetching item info")
					fetch(
						`https://rsl29x3g0h.execute-api.us-east-1.amazonaws.com/dev/images/${imageId}/meta/rarible`,
						{
							method: 'GET',
							headers: {
								'Content-Type': 'application/json'
							},
						}
					).then((itemMetaRarible) => {
						return itemMetaRarible.json();
					}).then((patchNftInfo) => {
						setProgressText("Updating nft info in db")
						patchNftInfo['metadata_uri'] = `https://ipfs.io${metadataUri}`
						patchNftInfo['rarible_token'] = response['id']
						console.log(JSON.stringify(patchNftInfo))

						fetch(
							`https://rsl29x3g0h.execute-api.us-east-1.amazonaws.com/dev/images/${imageId}`,
							{
								method: 'PATCH',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({'nft_info': patchNftInfo})
							}).then((patchResponse) => {
							return patchResponse.json()
						}).then((result) => {
							console.log(result)
							setProgressText("Updating nft info is complete.")
						})
					});

					onComplete(await prepare.submit({
						price: toBigNumber(formData.price),
						amount: parseInt(formData.amount),
						currency: getCurrency(connection.sdk.wallet?.blockchain, "NATIVE")
					}))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput
						type="number"
						inputProps={{ min: 0, step: "any" }}
						form={form}
						options={{
							min: 0
						}}
						name="price"
						label="Price"
						defaultValue={1}
					/>
					<FormTextInput
						type="number"
						inputProps={{ min: 1, max: prepare.maxAmount, step: 1 }}
						form={form}
						options={{
							min: 1,
							max: Number(prepare.maxAmount)
						}}
						defaultValue={Math.min(1, Number(prepare.maxAmount))}
						name="amount"
						label="Amount"
					/>
					<Box>
						<FormSubmit
							form={form}
							label="Submit"
							state={resultToState(result.type)}
							disabled={disabled}
						/>
					</Box>
				</Stack>
			</form>
			<Card>
				<h5>Progress</h5>
				<Box>
					{progressText}
				</Box>
				<h5>Item Info</h5>
				<Box>
					{itemInfo}
				</Box>
			</Card>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</>
	)
}
