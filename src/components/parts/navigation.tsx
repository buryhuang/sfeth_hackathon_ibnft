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
		label: "Creator: Mint Model Token",
		path: "/mint",
		default: true
	}, {
		label: "Sell",
		path: "/sell"
	}, {
		label: "Buy",
		path: "/buy"
	}, {
		label: "Bid",
		path: "/bid"
	}, {
		label: "Accept Bid",
		path: "/accept-bid"
	}]

	return (
		<List>
			{links.map((link) => (
				<ListItemLink key={link.path} to={link.path} primary={link.label} default={link.default}/>
			))}
		</List>
	)
}
