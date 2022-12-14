import React, { useContext } from "react"
import { Box, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { PrepareMintResponse } from "@rarible/sdk/build/types/nft/mint/domain"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { RequestResult } from "../../components/common/request-result"

interface IMintPrepareFormProps {
	disabled?: boolean,
	onComplete: (response: boolean) => void
}

export function MintPrepareForm({ disabled, onComplete }: IMintPrepareFormProps) {
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
				try {
					onComplete(true);
					// const collection = await connection.sdk.apis.collection.getCollectionById({
					// 	collection: "ETHEREUM:0x2002f5c63ab1bf081bfb02447a4c4db4e4f55f21",
					// })
					// onComplete(await connection.sdk.nft.mint({ collection }))
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					{/*<FormTextInput form={form} name="collectionId" label="Collection ID" value="ETHEREUM:0x2002f5c63ab1bf081bfb02447a4c4db4e4f55f21"/>*/}
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
