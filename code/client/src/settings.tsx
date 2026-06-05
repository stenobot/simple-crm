import { ManageFields } from "./manage-fields";
import { ManageStages } from "./manage-stages";
import { ManageSettings } from "./manage-settings";

export const Settings: React.FC = () => (
    <>
        <ManageFields />
        <ManageStages />
        <ManageSettings />
    </>
);
