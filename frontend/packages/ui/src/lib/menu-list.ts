import {   
	LayoutGrid,
	TrendingUp,
	HomeIcon,
	ClipboardType
} from "lucide-react";
  
type Submenu = {
	href: string;
	label: string;
	active: boolean;
};
  
type Menu = {
	href: string;
	label: string;
	active: boolean;
	icon: any;
	submenus: Submenu[];
};
  
type Group = {
	groupLabel: string;
	menus: Menu[];
};
  
export function getMenuList(pathname: string): Group[] {
    return [
		{
			groupLabel: "",
			menus: [
				{
					href: "/home",
					label: "Home",
					active: pathname.includes("/home"),
					icon: HomeIcon,
					submenus: []
				}
			]
		},
		{
			groupLabel: "",
			menus: [
				{
					href: "/dashboard",
					label: "Dashboard",
					active: pathname.includes("/dashboard"),
					icon: LayoutGrid,
					submenus: []
				}
			]
		},
		{
			groupLabel: "",
			menus: [
				{
					href: "/form-elements",
					label: "Form Elements",
					active: pathname.includes("/form-elements"),
					icon: ClipboardType,
					submenus: []
				}
			]
		},
		
		{
			groupLabel: "Datatables",
			menus: [
				{
					href: "/datatable",
					label: "Datatable",
					active: pathname === "/datatable",
					icon: TrendingUp,
					submenus: []
				},
			]
		},
    ];
}