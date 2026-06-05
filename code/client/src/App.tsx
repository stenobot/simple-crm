import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Leads } from "./leads";
import { Pipeline } from "./pipeline";
import { Forecast } from "./forecast";
import { Settings } from "./settings";
import { GearIcon } from "./icons";

const textNavClass = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-2 text-base transition ${
        isActive
            ? "text-gray-900 font-bold underline underline-offset-4"
            : "text-gray-600 font-medium hover:text-gray-900"
    }`;

const iconNavClass = ({ isActive }: { isActive: boolean }) =>
    `p-2 rounded transition ${
        isActive
            ? "text-gray-900 bg-gray-100"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

export const App: React.FC = () => (
    <div className="p-4 space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">SimpleCRM</h1>
            <nav className="flex gap-2 items-center">
                <NavLink to="/" end className={textNavClass}>
                    Home
                </NavLink>
                <NavLink to="/pipeline" className={textNavClass}>
                    Pipeline
                </NavLink>
                <NavLink to="/forecast" className={textNavClass}>
                    Forecast
                </NavLink>
                <NavLink
                    to="/settings"
                    className={iconNavClass}
                    title="Settings"
                    aria-label="Settings">
                    <GearIcon className="w-5 h-5" />
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
