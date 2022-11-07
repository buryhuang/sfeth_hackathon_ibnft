import React, { useContext } from "react"
import { Box, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { PrepareFillResponse } from "@rarible/sdk/build/types/order/fill/domain"
import { toOrderId } from "@rarible/types"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"

interface IBuyPrepareFormProps {
	disabled?: boolean
	onComplete: (response: boolean) => void
}

export function BuyPrepareForm({ disabled, onComplete }: IBuyPrepareFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				if (!connection.sdk) {
					return
				}

				console.log(formData.modelId, formData.prompt)

				fetch(
					`https://r21a7bair0.execute-api.us-east-1.amazonaws.com/hack/model/1/request`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							prompt: formData.prompt,
						})
					}).then((mintResponse) => {
					return mintResponse.json();
				}).then((result) => {
					console.log(result)
					// setProgressText("Finished minted NFT: " + result);
				}).catch((error) => {
					console.log(error);
					// setProgressText("Error getting NFT metadata.")
				});

				try {
					onComplete(true)
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<FormTextInput form={form} name="orderId" label="Model Token ID"/>
					<FormTextInput form={form} name="prompt" label="Prompt"/>
					<Box>
						<FormSubmit
							form={form}
							label="Next"
							state={resultToState(result.type)}
							icon={faChevronRight}
							disabled={disabled}
						/>
					</Box>
				</Stack>
			</form>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</>
	)
}
