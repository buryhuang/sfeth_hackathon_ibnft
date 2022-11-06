import React, {useContext, useState} from "react"
import {Box, Card, Typography} from "@mui/material"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { InlineCode } from "../../components/common/inline-code"
import { CopyToClipboard } from "../../components/common/copy-to-clipboard"
import { MintPrepareForm } from "./mint-prepare-form"
import { MintForm } from "./mint-form"
import { MintComment } from "./comments/mint-comment"
import { TransactionInfo } from "../../components/common/transaction-info"
import { UnsupportedBlockchainWarning } from "../../components/common/unsupported-blockchain-warning"
import { Blockchain } from "@rarible/api-client"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"

function validateConditions(blockchain: Blockchain | undefined): boolean {
	return !!blockchain
}

export function MintPage() {
	const connection = useContext(ConnectorContext)
	const blockchain = connection.sdk?.wallet?.blockchain
	const [progressText, setProgressText] = useState("Processing ...")

	let finishedUpdate = false;

	return (
		<Page header="Creator: Mint Model Token">
			{
				!validateConditions(blockchain) && <CommentedBlock sx={{ my: 2 }}>
                    <UnsupportedBlockchainWarning blockchain={blockchain}/>
                </CommentedBlock>
			}
			<CommentedBlock sx={{ my: 2 }} comment={""}>
				<FormStepper
					steps={[
						{
							label: "Upload Model",
							render: (onComplete) => {
								return <MintPrepareForm
									onComplete={onComplete}
									disabled={!validateConditions(blockchain)}
								/>
							}
						},
						{
							label: "Send Transaction",
							render: (onComplete, lastResponse) => {
								return <MintForm
									onComplete={onComplete}
									prepare={lastResponse}
									disabled={!validateConditions(blockchain)}
								/>
							}
						},
						{
							label: "Done",
							render: (onComplete, lastResponse) => {
								console.log(lastResponse)

								const metadataUri = localStorage.getItem('metadata_ipfs_uri')
								console.log("metadata_ipfs_uri:", metadataUri);
								if (!finishedUpdate) {
									fetch(
										metadataUri || "",
										{
											method: 'GET',
										}
									).then((itemMeta) => {
										return itemMeta.json();
									}).then((nftInfo) => {
										nftInfo['metadata_uri'] = metadataUri
										console.log(JSON.stringify(nftInfo))
										setProgressText("Finished minted NFT.")
										// fetch(
										// 'https://r21a7bair0.execute-api.us-east-1.amazonaws.com/hack',
										// {
										// 	method: 'PUT',
										// 	headers: {
										// 		'Content-Type': 'application/json'
										// 	},
										// 	body: JSON.stringify(nftInfo)
										// }).then((mintResponse) => {
										// 	return mintResponse.json()
										// }).then((result) => {
										// 	console.log(result)
										// 	finishedUpdate = true
										// 	setProgressText("Finished minted NFT.")
										// }).catch((error) => {
										// 	console.log(error);
										// 	setProgressText("Error getting NFT metadata.")
										// });
									}).catch((error) => {
										console.log(error);
										setProgressText("Error minting NFT.")
									});
								}

								return <RequestResult
									result={{ type: "complete", data: lastResponse }}
									completeRender={(data) =>
										<>
											<Box sx={{ my: 2 }}>
												<Typography variant="overline">Type:</Typography>
												<div>
													<InlineCode wrap>{data.type}</InlineCode>
												</div>
											</Box>
											<Box sx={{ my: 2 }}>
												<Typography variant="overline">Item ID:</Typography>
												<div>
													<InlineCode wrap>{data.itemId}</InlineCode> <CopyToClipboard value={data.itemId}/>
												</div>
											</Box>
											<Box sx={{ my: 2 }}>
												<Typography variant="overline">View In Polyscan:</Typography>
												<div>
													<a href='https://rarible.com/artsio'>https://mumbai.polygonscan.com/</a>
												</div>
											</Box>
											<Card>
												{progressText}
											</Card>
											{
												data.type === "on-chain" &&
													<Box sx={{ my: 2 }}>
														<TransactionInfo transaction={data.transaction}/>
													</Box>
											}
										</>
									}
								/>
							}
						}
					]}
				/>
			</CommentedBlock>


		</Page>
	)
}
