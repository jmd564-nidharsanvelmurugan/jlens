import { Menu } from './menu';
import { SidebarToggle } from "@/components/ui/sidebar-toggle";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const { setTheme, theme } = useTheme();
  
  if(!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full -translate-x-full lg:translate-x-0 transition-[width] ease-in-out bg-gradient-to-b from-white to-white dark:from-[#161d29] dark:to-[#161d29] duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <div className="absolute opacity-30 top-0 left-0 w-full h-full sidebar-bg"></div>
      <div className="bg-[url('../../public/LogoIcons/All_Seeing_Slidebar_Background_Dark.svg')] h-full">
        <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
        <div className="relative h-full flex flex-col overflow-y-auto shadow-md dark:shadow-zinc-800">
          <Button
            className={cn(
              "transition-transform ease-in-out duration-300 mb-1",
              sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
            )}
            variant="link"
            asChild
          >
            <Link href="/home" className="flex items-center gap-2 h-auto">
              {/* <PanelsTopLeft className="w-6 h-6 mr-1" /> */}
              {sidebar?.isOpen === true ? (
                <div className="flex mt-5 justify-center">
                  {
                    theme === "dark" ? (
                      <Image
                        src="/logo_light.svg"
                        alt="JMAN Logo"
                        width={130}
                        height={62}
                        className="mb-1"
                      />
                    ) : (
                      <Image
                        src="/logo_dark.svg"
                        alt="JMAN Logo"
                        width={130}
                        height={62}
                        className="mb-1"
                      />
                    )
                  }
                </div> ) : (
                  <>
                    {
                      theme === "dark" ? (
                        <Image
                          src="/logo_icon.png"
                          alt="JMAN"
                          width={30}
                          height={30}
                          className="mr-3 mt-8 mb-4"
                        />
                      ) : (
                        <Image
                          src="/logo_icon.png"
                          alt="JMAN"
                          width={30}
                          height={30}
                          className="mr-3 mt-8 mb-4"
                        />
                      )
                    }
                  </>
                )}
              <h1
                className={cn(
                  "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                  sidebar?.isOpen === false
                    ? "-translate-x-96 opacity-0 hidden"
                    : "translate-x-0 opacity-100"
                )}
              >
              </h1>
            </Link>
          </Button>
          <Menu isOpen={sidebar?.isOpen} />
        </div>
      </div>
    </aside>
  );
}