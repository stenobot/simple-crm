import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Leads } from "./leads";
import { Pipeline } from "./pipeline";
import { Forecast } from "./forecast";
import { Settings } from "./settings";

const navClass = "px-4 py-2 rounded font-medium transition";
const activeNavClass = "bg-blue-500 text-white";
const inactiveNavClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${navClass} ${isActive ? activeNavClass : inactiveNavClass}`;

export const App: React.FC = () => (
    <div className="p-4 space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">SimpleCRM</h1>
            <nav className="flex gap-2">
                <NavLink to="/" end className={navLinkClass}>
                    Home
                </NavLink>
                <NavLink to="/pipeline" className={navLinkClass}>
                    Pipeline
                </NavLink>
                <NavLink to="/forecast" className={navLinkClass}>
                    Forecast
                </NavLink>
                <NavLink to="/settings" className={navLinkClass}>
                    Settings
                </NavLink>
            </nav>
        </div>

        <Routes>
            <Route path="/" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
);

export default App;
