import React, {useContext, useEffect, useState} from "react"
import { useForm } from "react-hook-form"
import {Box, Card, Stack} from "@mui/material"
import { MintResponse, PrepareMintResponse } from "@rarible/sdk/build/types/nft/mint/domain"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { FormSubmit } from "../../components/common/form/form-submit"
import { resultToState, useRequestResult } from "../../components/hooks/use-request-result"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { FormCheckbox } from "../../components/common/form/form-checkbox"
import { RequestResult } from "../../components/common/request-result"


interface IMintFormProps {
	prepare: PrepareMintResponse
	disabled?: boolean
	onComplete: (response: boolean) => void
}

export function MintForm({ prepare, disabled, onComplete }: IMintFormProps) {
	const connection = useContext(ConnectorContext)
	const form = useForm()
	const { handleSubmit } = form
	const { result, setError } = useRequestResult()

	const [progressText, setProgressText] = useState("Not started.");
	const [imageMetadata, setImageMetadata] = useState("{}");
	const [metadataUri, setMetadataUri] = useState("");
	const [modelFileUri, setModelFileUri] = useState("");
	const [modelName, setModelName] = useState("");
	const [file, setFile] = useState(new File([], "empty"));
	const [binaryData, setBinaryData] = useState("empty payload unfortunetelly");

	function handleChange(event: any) {
		setFile(event.target.files[0])
	}

	async function readFile() {
		let reader = new FileReader();
		reader.onload = function(e) {
			// binary data
			console.log('done reading file');
			// @ts-ignore
			setBinaryData(e.target?.result);
		};
		reader.onerror = function(e) {
			// error occurred
			console.log('Error : ' + e.type);
		};
		await reader.readAsBinaryString(file);
	}

	return (
		<>
			<form onSubmit={handleSubmit(async (formData) => {
				// if (!connection.sdk) {
				// 	return
				// }

				localStorage.setItem('imageId', formData.imageId)

				console.log(file);

				await readFile();

				setProgressText(`Done reading ${file.name}, uploading to IPFS via nft.storage...`);
				// const storageFormData  = new FormData();
				// storageFormData.append(`${formData.imageId}.json`, JSON.stringify(imageMetadata));

				const nftStoreResponse = await fetch(
					`https://api.nft.storage/upload`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFiOEZCMTU2Qzk5NEJkMERkQzMxMDQ3Njc5MTZGMDVDMDFhZkQ2RUQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NDAzMjQ0NTMxOSwibmFtZSI6IkFydHNpbyJ9.FUiSZ3GXt2r_AHC8nYRLOjTrMXGhn2PRThHDxol3BO8`
						},
						body: binaryData
					}
				);
				const storeInfo = await nftStoreResponse.json()
				console.log(storeInfo)
				setProgressText(`Model stored successfully on nft.storage on ipfs: https://ipfs.io/ipfs/${storeInfo.value.cid}`)
				const modelFileUri = `https://ipfs.io/ipfs/${storeInfo.value.cid}`
				setModelFileUri(modelFileUri);

				try {
					const imageMetadata = {
						'model_name': formData.modelName,
						'model_uri': modelFileUri
					};
					setImageMetadata(JSON.stringify(imageMetadata))
					console.log(imageMetadata)

					setProgressText(`Uploading image metadata to nft.storage for ${formData.modelName}`)
					// const storageFormData  = new FormData();
					// storageFormData.append(`${formData.imageId}.json`, JSON.stringify(imageMetadata));

					const nftStoreResponse = await fetch(
						`https://api.nft.storage/upload`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFiOEZCMTU2Qzk5NEJkMERkQzMxMDQ3Njc5MTZGMDVDMDFhZkQ2RUQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NDAzMjQ0NTMxOSwibmFtZSI6IkFydHNpbyJ9.FUiSZ3GXt2r_AHC8nYRLOjTrMXGhn2PRThHDxol3BO8`
							},
							body: JSON.stringify(imageMetadata)
						}
					);
					const storeInfo = await nftStoreResponse.json()
					console.log(storeInfo)
					setProgressText(`Image metadata stored successfully on nft.storage on ipfs: https://ipfs.io/ipfs/${storeInfo.value.cid}`)
					const metadataUri = `ipfs://ipfs/${storeInfo.value.cid}`
					setMetadataUri(metadataUri)

					localStorage.setItem('metadata_ipfs_uri', `https://ipfs.io/ipfs/${storeInfo.value.cid}`)
					onComplete(true);
				} catch (e) {
					setError(e)
				}
			})}
			>
				<Stack spacing={2}>
					<input type="file" onChange={handleChange}/>
					{/*<FormTextInput form={form} name="imageId" placeholder="Example: eb84534b480d486b30cc006cd70d9c37e7392cf6b830e4efe69da47182b035ba"/>*/}
					<FormTextInput form={form} name="modelName" placeholder="Model 0"/>
					{/*<FormTextInput form={form} name="metadataUri" label="Metadata Uri" value={metadataUri} disabled/>*/}
					{/*<FormTextInput*/}
					{/*	type="number"*/}
					{/*	form={form}*/}
					{/*	name="supply"*/}
					{/*	label="Supply"*/}
					{/*	defaultValue={1}*/}
					{/*	// disabled={!prepare.multiple}*/}
					{/*	disabled={true}*/}
					{/*	helperText={!prepare.multiple ? "Collection does not support multiple mint" : null}*/}
					{/*/>*/}
					{/*<FormCheckbox*/}
					{/*	form={form}*/}
					{/*	name="lazy"*/}
					{/*	label="Lazy-mint"*/}
					{/*	// disabled={!prepare.supportsLazyMint}*/}
					{/*	disabled*/}
					{/*	checked={true}*/}
					{/*	//helperText={!prepareResponse.multiple ? "Collection does not support multiple mint" : null}*/}
					{/*/>*/}
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
				<h5>MetadataUri: </h5>
				<Box>
					{metadataUri}
				</Box>
			</Card>
			<Card>
				<h5>Progress: </h5>
				<Box>
					{progressText}
				</Box>
			</Card>
			<Card>
				<h5>Image Metadata: </h5>
				<Box>
					{imageMetadata}
				</Box>
			</Card>
			<Box sx={{ my: 2 }}>
				<RequestResult result={result}/>
			</Box>
		</>
	)
}
