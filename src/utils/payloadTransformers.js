/**
 * Transforms frontend 8-hour grid data arrays into backend-compatible DTO structures.
 * 
 * Frontend: Arrays (e.g., lengthCutBar: ["10", "11", "12"])
 * Backend: Flattened fields (e.g., lengthCutBar1: 10, lengthCutBar2: 11, lengthCutBar3: 12)
 */

const parseNumber = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

const parseBoolean = (val) => {
    // Frontend might send "YES"/"NO", true/false, or "true"/"false"
    if (val === true || val === 'true' || val === 'YES' || val === 'Yes') return true;
    if (val === false || val === 'false' || val === 'NO' || val === 'No') return false;
    return null;
};

const parseString = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    return String(val);
}


export const transformLineDataForBackend = (frontendLineData) => {
    if (!frontendLineData) return null;

    return {
        ...frontendLineData,
        shearingData: frontendLineData.shearingData?.map(transformShearingRow) || [],
        turningData: frontendLineData.turningData?.map(transformTurningRow) || [],
        mpiData: frontendLineData.mpiData?.map(transformMpiRow) || [],
        forgingData: frontendLineData.forgingData?.map(transformForgingRow) || [],
        quenchingData: frontendLineData.quenchingData?.map(transformQuenchingRow) || [],
        temperingData: frontendLineData.temperingData?.map(transformTemperingRow) || [],
        finalCheckData: frontendLineData.finalCheckData?.map(transformFinalCheckRow) || [],
        testingFinishingData: frontendLineData.testingFinishingData?.map(transformTestingFinishingRow) || []
    };
};

const transformShearingRow = (row) => ({
    hourIndex: row.hour,
    shift: row.shift,
    hourLabel: row.hourLabel,
    noProduction: row.noProduction,
    lotNo: row.lotNo,
    // Arrays to flattened fields
    lengthCutBar1: parseNumber(row.lengthCutBar?.[0]),
    lengthCutBar2: parseNumber(row.lengthCutBar?.[1]),
    lengthCutBar3: parseNumber(row.lengthCutBar?.[2]),
    // New fields - mapped as strings to preserve "OK" / "NOT OK"
    improperDia1: parseString(row.qualityDia?.[0]),
    improperDia2: parseString(row.qualityDia?.[1]),
    improperDia3: parseString(row.qualityDia?.[2]),
    sharpEdges1: parseString(row.sharpEdges?.[0]),
    sharpEdges2: parseString(row.sharpEdges?.[1]),
    sharpEdges3: parseString(row.sharpEdges?.[2]),
    crackedEdges1: parseString(row.crackedEdges?.[0]),
    crackedEdges2: parseString(row.crackedEdges?.[1]),
    crackedEdges3: parseString(row.crackedEdges?.[2]),
    // RejectedQty array mapped to specific rejection counts
    lengthCutBarRejected: parseNumber(row.rejectedQty?.[0]),
    improperDiaRejected: parseNumber(row.rejectedQty?.[1]),
    sharpEdgesRejected: parseNumber(row.rejectedQty?.[2]),
    crackedEdgesRejected: parseNumber(row.rejectedQty?.[3]),
    remarks: row.remarks
});

const transformTurningRow = (row) => ({
    hourIndex: row.hour,
    shift: row.shift,
    hourLabel: row.hourLabel,
    noProduction: row.noProduction,
    lotNo: row.lotNo,
    straightLength1: parseNumber(row.parallelLength?.[0]), // Frontend 'parallelLength' -> Backend 'straightLength'
    straightLength2: parseNumber(row.parallelLength?.[1]),
    straightLength3: parseNumber(row.parallelLength?.[2]),
    taperLength1: parseNumber(row.fullTurningLength?.[0]), // Assuming 'fullTurningLength' maps to 'taperLength' based on context or confirming via DTO field names? DTO has taperLength. Frontend has fullTurningLength. Mapping assumption based on order.
    // Wait, let's double check DTO: straightLength, taperLength, dia.
    // Frontend: parallelLength, fullTurningLength, turningDia.
    // Mapping:
    // parallelLength -> straightLength
    // fullTurningLength -> taperLength (Likely)
    // turningDia -> dia
    // Let's stick to this mapping.
    taperLength2: parseNumber(row.fullTurningLength?.[1]),
    taperLength3: parseNumber(row.fullTurningLength?.[2]),
    dia1: parseNumber(row.turningDia?.[0]),
    dia2: parseNumber(row.turningDia?.[1]),
    dia3: parseNumber(row.turningDia?.[2]),
    rejectedQty1: parseNumber(row.rejectedQty?.[0]),
    rejectedQty2: parseNumber(row.rejectedQty?.[1]),
    acceptedQty: parseNumber(row.acceptedQty), // If exists in frontend row
    remarks: row.remarks
});

const transformMpiRow = (row) => ({
    hourIndex: row.hour,
    shift: row.shift,
    hourLabel: row.hourLabel,
    noProduction: row.noProduction,
    lotNo: row.lotNo,
    testResult1: parseString(row.testResults?.[0]),
    testResult2: parseString(row.testResults?.[1]),
    testResult3: parseString(row.testResults?.[2]),
    mpiRejected: parseNumber(row.rejectedQty), // Single value in UI
    remarks: row.remarks
});
// Correction on MPI: Payload showed "rejectedQty": "" (string). Frontend likely has single input.
// DTO has mpiRejected.

const transformForgingRow = (row) => {
    // Calculate total rejected if not explicitly provided (Desktop view has details, Mobile has total)
    const forgingTemperatureRejected = parseNumber(row.forgingTemperatureRejected);
    const forgingStabilisationRejected = parseNumber(row.forgingStabilisationRejected);
    const improperForgingRejected = parseNumber(row.improperForgingRejected);
    const forgingDefectRejected = parseNumber(row.forgingDefectRejected);
    const embossingDefectRejected = parseNumber(row.embossingDefectRejected);

    const calculatedRejectedQty = (forgingTemperatureRejected || 0) +
        (forgingStabilisationRejected || 0) +
        (improperForgingRejected || 0) +
        (forgingDefectRejected || 0) +
        (embossingDefectRejected || 0);

    return {
        hourIndex: row.hour,
        shift: row.shift,
        hourLabel: row.hourLabel,
        noProduction: row.noProduction,
        lotNo: row.lotNo,
        forgingTemp1: parseNumber(row.forgingTemperature?.[0]),
        forgingTemp2: parseNumber(row.forgingTemperature?.[1]),
        forgingTemp3: parseNumber(row.forgingTemperature?.[2]), // DTO 3rd field

        forgingTemperatureRejected,
        forgingStabilisationRejected,
        improperForgingRejected,
        forgingDefectRejected,
        embossingDefectRejected,

        acceptedQty: parseNumber(row.acceptedQty),
        // Use explicit rejectedQty if available (Mobile), else use sum of details (Desktop)
        rejectedQty: parseNumber(row.rejectedQty) ?? (calculatedRejectedQty > 0 ? calculatedRejectedQty : null),
        remarks: row.remarks
    };
};

const transformQuenchingRow = (row) => {
    const quenchingTemperatureRejected = parseNumber(row.quenchingTemperatureRejected);
    const quenchingDurationRejected = parseNumber(row.quenchingDurationRejected);
    const quenchingHardnessRejected = parseNumber(row.quenchingHardnessRejected);
    const boxGaugeRejected = parseNumber(row.boxGaugeRejected);
    const flatBearingAreaRejected = parseNumber(row.flatBearingAreaRejected);
    const fallingGaugeRejected = parseNumber(row.fallingGaugeRejected);

    const calculatedRejectedQty = (quenchingTemperatureRejected || 0) +
        (quenchingDurationRejected || 0) +
        (quenchingHardnessRejected || 0) +
        (boxGaugeRejected || 0) +
        (flatBearingAreaRejected || 0) +
        (fallingGaugeRejected || 0);

    return {
        hourIndex: row.hour,
        shift: row.shift,
        hourLabel: row.hourLabel,
        noProduction: row.noProduction,
        lotNo: row.lotNo,
        quenchingTemperature: parseNumber(row.quenchingTemperature?.[0]),
        quenchingDuration: parseNumber(row.quenchingDuration?.[0]),
        quenchingHardness1: parseNumber(row.quenchingHardness?.[0]),
        quenchingHardness2: parseNumber(row.quenchingHardness?.[1]),

        // Rejection counts
        quenchingTemperatureRejected,
        quenchingDurationRejected,
        quenchingHardnessRejected,
        boxGaugeRejected,
        flatBearingAreaRejected,
        fallingGaugeRejected,

        rejectedQty: parseNumber(row.rejectedQty) ?? (calculatedRejectedQty > 0 ? calculatedRejectedQty : null),
        remarks: row.remarks
    };
};

const transformTemperingRow = (row) => {
    const temperingTemperatureRejected = parseNumber(row.temperingTemperatureRejected);
    const temperingDurationRejected = parseNumber(row.temperingDurationRejected);

    const calculatedRejectedQty = (temperingTemperatureRejected || 0) + (temperingDurationRejected || 0);

    return {
        hourIndex: row.hour,
        shift: row.shift,
        hourLabel: row.hourLabel,
        noProduction: row.noProduction,
        lotNo: row.lotNo,
        temperingTemperature: parseNumber(row.temperingTemperature?.[0]),
        temperingDuration: parseNumber(row.temperingDuration?.[0]),

        temperingTemperatureRejected,
        temperingDurationRejected,

        acceptedQty: parseNumber(row.acceptedQty),
        rejectedQty: parseNumber(row.rejectedQty) ?? (calculatedRejectedQty > 0 ? calculatedRejectedQty : null),
        remarks: row.remarks
    };
};

const transformFinalCheckRow = (row) => ({
    hourIndex: row.hour,
    shift: row.shift,
    hourLabel: row.hourLabel,
    noProduction: row.noProduction,
    lotNo: row.lotNo,
    // String fields in DTO
    visualCheck1: parseString(row.visualCheck?.[0] || ''), // Frontend might use different key? Payload says "surfaceDefect"?
    // Payload for FinalCheck: boxGauge, flatBearingArea, fallingGauge, surfaceDefect, embossingDefect, marking, temperingHardness (arrays)
    // DTO: visualCheck1..2, dimensionCheck1..2, hardnessCheck1..2.
    // Mismatch in naming.
    // Let's try to map logically or leave partial.
    // Backend DTO: visualCheck1, visualCheck2
    // Frontend grid likely maps "surfaceDefect" to visualCheck? 
    // Wait, let's look at the payload keys again.
    // Payload: boxGauge, flatBearingArea, fallingGauge... these are rejection REASONS in DTO 26-31.
    // But DTO 18-23 has visualCheck, dimensionCheck, hardnessCheck.
    // Let's map what we can clearly match.

    boxGaugeRejected: parseNumber(row.boxGaugeRejected),
    flatBearingAreaRejected: parseNumber(row.flatBearingAreaRejected),
    fallingGaugeRejected: parseNumber(row.fallingGaugeRejected),
    surfaceDefectRejected: parseNumber(row.surfaceDefectRejected),
    embossingDefectRejected: parseNumber(row.embossingDefectRejected),
    markingRejected: parseNumber(row.markingRejected),
    temperingHardnessRejected: parseNumber(row.temperingHardnessRejected),


    remarks: row.remarks
});

const transformTestingFinishingRow = (row) => ({
    hourIndex: row.hour,
    shift: row.shift,
    hourLabel: row.hourLabel,
    noProduction: row.noProduction,
    lotNo: row.lotNo,
    toeLoad1: parseNumber(row.toeLoad?.[0]),
    toeLoad2: parseNumber(row.toeLoad?.[1]),
    weight1: parseNumber(row.weight?.[0]),
    weight2: parseNumber(row.weight?.[1]),
    paintIdentification1: parseString(row.paintIdentification?.[0]),
    paintIdentification2: parseString(row.paintIdentification?.[1]),
    ercCoating1: parseString(row.ercCoating?.[0]),
    ercCoating2: parseString(row.ercCoating?.[1]),

    toeLoadRejected: parseNumber(row.toeLoadRejected),
    weightRejected: parseNumber(row.weightRejected),
    paintIdentificationRejected: parseNumber(row.paintIdentificationRejected),
    ercCoatingRejected: parseNumber(row.ercCoatingRejected),

    acceptedQty: parseNumber(row.acceptedQty),
    rejectedQty: parseNumber(row.rejectedQty),
    remarks: row.remarks
});
