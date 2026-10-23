import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardIndex from './components/DashboardIndex';
import { RequireAnyPermission, RequireAuth, RequirePermission, RequireSuperAdmin } from './components/Guards';
import HomeIndex from './components/HomeIndex';
import LinksTable from './components/LinksTable';
import RolesTable from './components/RolesTable';
import SlidesTable from './components/SlidesTable';
import VisitsTable from './components/VisitsTable';
import UsersExcel from './components/UsersExcel';

/**
 * Client-side routes for the dashboard shell. `HomeIndex` renders the app bar
 * and drawer, while each child route fills the main content area.
 */
export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeIndex />}>
                    <Route index element={<DashboardIndex />} />
                    <Route
                        path="visits"
                        element={
                            <RequireAuth>
                                <RequirePermission permission="VisitIndex">
                                    <VisitsTable />
                                </RequirePermission>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="slides"
                        element={
                            <RequireAuth>
                                <RequirePermission permission="Slide">
                                    <SlidesTable />
                                </RequirePermission>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="links"
                        element={
                            <RequireAuth>
                                <RequirePermission permission="Link">
                                    <LinksTable />
                                </RequirePermission>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <RequireAuth>
                                <RequireAnyPermission permissions={['UserManager', 'UserIndex']}>
                                    <UsersExcel />
                                </RequireAnyPermission>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="roles"
                        element={
                            <RequireAuth>
                                <RequireSuperAdmin>
                                    <RolesTable />
                                </RequireSuperAdmin>
                            </RequireAuth>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
