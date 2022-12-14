import React from "react"
import { List } from "@mui/material"
import { ListItemLink } from "../common/list-item-link"


export function Navigation() {
	const links = [
	// 	{
	// 	label: "About",
	// 	path: "/about",
	// 	default: true
	// },
		{
		label: "Connect",
		path: "/connect"
	},
	// 	{
	// 	label: "Deploy Collection",
	// 	path: "/deploy"
	// },
		{
		label: "Publisher: Mint Model Token",
		path: "/mint",
		default: true
	}, {
		label: "User: Pay and Request",
		path: "/buy"
	}, {
		label: "Miner: Process Tasks & Generate Images",
		path: "/bid"
	}]

	return (
		<List>
			{links.map((link) => (
				<ListItemLink key={link.path} to={link.path} primary={link.label} default={link.default}/>
			))}
		</List>
	)
}
