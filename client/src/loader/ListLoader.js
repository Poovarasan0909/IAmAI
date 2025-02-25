import React from 'react'
import ContentLoader from 'react-content-loader'
import {getThemeMode} from "../service/commonFun";
import useIsMobile from "../hooks/useIsMobile";

const ListLoader = () => {
    const themeMode = getThemeMode();
    const isMobile = useIsMobile()
    return (
        <ContentLoader viewBox={isMobile ? "0 0 365 450" : "0 0 750 450"} height={420} width={isMobile ? 365 : 750 } backgroundColor={themeMode === 'light' ? "#efeded" : "#878181"} foregroundColor={themeMode === 'light' ? "#ddd8d8" : "#ddd8d8"}>
            <rect x="0" y="12" rx="5" ry="5" width="290" height="20" />
            <rect x="0" y="38" rx="5" ry="5" width="220" height="20" />
            <rect x="200" y="64" rx="5" ry="5" width="290" height="20" />
            <rect x="200" y="90" rx="5" ry="5" width="220" height="20" />
            <rect x="0" y="116" rx="5" ry="5" width="290" height="20" />
            <rect x="0" y="142" rx="5" ry="5" width="220" height="20" />
            {/* Extra Elements - Now within visible range */}
            <rect x="0" y="168" rx="5" ry="5" width="290" height="20" />
            <rect x="200" y="194" rx="5" ry="5" width="220" height="20" />
            <rect x="200" y="220" rx="5" ry="5" width="290" height="20" />
            <rect x="0" y="246" rx="5" ry="5" width="220" height="20" />
            <rect x="0" y="272" rx="5" ry="5" width="220" height="20" />
            <rect x="200" y="298" rx="5" ry="5" width="290" height="20" />
            <rect x="0" y="324" rx="5" ry="5" width="200" height="20" />
            <rect x="200" y="350" rx="5" ry="5" width="290" height="20" />
            <rect x="0" y="376" rx="5" ry="5" width="220" height="20" />
            <rect x="0" y="402" rx="5" ry="5" width="220" height="20" />
        </ContentLoader>);

}

export default ListLoader;