import { AppShell, ColorSchemeToggle, Footer, Header } from "@wso2/oxygen-ui";
import { Outlet } from "react-router";
import type { JSX } from "react";

// The app's one shell. The wireframes draw a brand-only navbar on every
// screen and no sidebar at all — this is a two-screen app with no role-based
// navigation rail — so AppShell.Sidebar is simply not rendered.
export default function AppLayout(): JSX.Element {
  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Brand>
            <Header.BrandTitle>Todo App</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
