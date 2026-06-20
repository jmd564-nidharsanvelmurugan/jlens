import { Button } from "@/components/ui/button"
import { CollapseMenuButton } from "@/components/ui/collapse-menu-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"
import { useStore } from "@/hooks/use-store"
import { getMenuList } from "@/lib/menu-list"
import { cn } from "@/lib/utils"
import {
    Ellipsis,
    LogOut,
    MoonIcon,
    SunIcon
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Separator } from "./separator"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
    ChevronUp
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { UserContext } from "@/context/UserContext"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useContext } from "react"
interface MenuProps {
	isOpen: boolean | undefined
}

export function Menu({isOpen}: MenuProps) {
	const router = useRouter()
	const pathname: any = usePathname()
	const menuList = getMenuList(pathname)
	const handleLogout = async () => {
		const response: any = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`, {
			method: "GET",
		})

		if (response.ok) {
			const data = await response.json();
			if(data?.data?.src == "sso"){
				const logoutUrl = `https://login.microsoftonline.com/${
					process.env.NEXT_PUBLIC_AZURE_AUTH_TENANT_ID
				}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(
					process.env.NEXT_PUBLIC_BASE_URL + "/login"
				)}`
				localStorage.removeItem("userState");
				localStorage.removeItem("appState");
				localStorage.removeItem("auth");
				window.location.href = logoutUrl
			} else {
				localStorage.removeItem("userState");
				localStorage.removeItem("appState");
				localStorage.removeItem("auth");
				window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/login`
			}
		}
	}

	const user = useContext(UserContext)

	const {setTheme, theme} = useTheme()
	const sidebar = useStore(useSidebarToggle, (state) => state)
	return (
		<ScrollArea className="[&>div>div[style]]:!block ">
			<nav className="mt-2 h-full w-full">
				<ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-5 pb-4">
					{menuList.map(({groupLabel, menus}, index) => (
						<li
							className={cn("w-full", groupLabel ? "" : "")}
							key={index}
						>
							{(isOpen && groupLabel) || isOpen === undefined ? (
								<div className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate ">
									<Separator className="mb-4" />
									{groupLabel}
								</div>
							) : !isOpen &&
							  isOpen !== undefined &&
							  groupLabel ? (
								<TooltipProvider>
									<Tooltip delayDuration={100}>
										<TooltipTrigger className="w-full">
											<div className="w-full flex justify-center items-center ">
												<Ellipsis className="h-5 w-5" />
											</div>
										</TooltipTrigger>
										<TooltipContent side="right">
											<p>{groupLabel}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							) : (
								<div></div>
							)}

							{menus.map(
								(
									{href, label, icon: Icon, active, submenus},
									index
								) =>
									submenus.length === 0 ? (
										<div className="w-full" key={index}>
											<TooltipProvider
												disableHoverableContent
											>
												<Tooltip delayDuration={100}>
													<TooltipTrigger asChild>
														<Button
															variant={
																active
																	? "default"
																	: "ghost"
															}
															className={cn(
																"w-full justify-start h-10 mb-1",
																active &&
																	"bg-foreground text-background" // Adjust the color as needed
															)}
															asChild
														>
															<Link href={href}>
																<span
																	className={cn(
																		isOpen ===
																			false
																			? ""
																			: "mr-4"
																	)}
																>
																	<Icon
																		size={
																			18
																		}
																	/>
																</span>
																<p
																	className={cn(
																		"max-w-[200px] truncate text-primary",
																		active &&
																			"text-background",
																		isOpen ===
																			false
																			? "-translate-x-96 opacity-0"
																			: "translate-x-0 opacity-100"
																	)}
																>
																	{label}
																</p>
															</Link>
														</Button>
													</TooltipTrigger>
													{isOpen === false && (
														<TooltipContent side="right">
															{label}
														</TooltipContent>
													)}
												</Tooltip>
											</TooltipProvider>
										</div>
									) : (
										<div className="w-full" key={index}>
											<CollapseMenuButton
												icon={Icon}
												label={label}
												active={active}
												submenus={submenus}
												isOpen={isOpen}
											/>
										</div>
									)
							)}
						</li>
					))}
					<li className="w-full grow flex items-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<div
									className={cn(
										"w-96 flex justify-between  items-center p-2  dark:border-gray-600 rounded-lg border-gray-300 ",
										sidebar?.isOpen &&
											"transition-all duration-200 hover:scale-105 border-[1.5px] cursor-pointer"
									)}
								>
									<div className="flex gap-3 items-center">
										<div>
											<Avatar>
												{
													user?.state?.headshot ? (
														<AvatarImage
															src={`data:image/*;base64,${user?.state?.headshot}`}
															alt="@shadcn"
														/>
													) : (
														<AvatarImage
															src="https://github.com/shadcn.png"
															alt="@shadcn"
														/>
													)
												}
												<AvatarFallback>
													JG
												</AvatarFallback>
											</Avatar>
										</div>
										<div>
											{sidebar?.isOpen === true && (
												<div>
													<p className="text-sm font-medium leading-none text-primary-foreground">
														{user?.state?.name}
													</p>
													<p className="text-xs leading-none text-muted-foreground w-[148px] overflow-hidden">
														{user?.state?.email}
													</p>
												</div>
											)}
										</div>
									</div>
									<div>
										{sidebar?.isOpen === true && (
											<ChevronUp className="h-4 w-4" />
										)}
									</div>
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56 ">
								<DropdownMenuLabel>
									My Account
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<Link
									href="https://github.com/jmangroup/JNext"
									target="_blank"
								>
									<DropdownMenuItem className="cursor-pointer">
										<GitHubLogoIcon className="mr-2 h-4 w-4" />
										<span>GitHub</span>
									</DropdownMenuItem>
								</Link>
								<DropdownMenuItem
									onClick={(e) => {
										e.preventDefault()
										setTheme(
											theme === "dark" ? "light" : "dark"
										)
									}}
									className="cursor-pointer"
								>
									<SunIcon className="mr-2 h-4 w-4 rotate-90 scale-0 transition-transform ease-in-out duration-500 dark:rotate-0 dark:scale-100" />
									<MoonIcon className="absolute mr-2 h-4 w-4 rotate-0 scale-100 transition-transform ease-in-out duration-500 dark:-rotate-90 dark:scale-0" />
									<span>Switch Theme</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<Link href="/login">
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={handleLogout}
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</Link>
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
				</ul>
			</nav>
		</ScrollArea>
	)
}