import React from 'react'

const StoreIcon = () => {
    return (
        <svg width="67" height="99" viewBox="0 0 67 99" fill="none" xmlns="http://www.w3.org/2000/svg" href="http://www.w3.org/1999/xlink">
            <rect width="67" height="99" fill="url(#pattern0_2145_362)" />
            <defs>
                <pattern id="pattern0_2145_362" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use href="#image0_2145_362" transform="matrix(0.01 0 0 0.00676768 0 0.161616)" />
                </pattern>
                <image id="image0_2145_362" width="100" height="100" href="data:image/png;base64,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" />
            </defs>
        </svg>

    )
}

export default StoreIcon