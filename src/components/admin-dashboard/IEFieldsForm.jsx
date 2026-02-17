import React, { useState } from 'react';

export const IEFieldsForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        // Section 1: Inspection Engineer Fields
        empCode: '',
        productToBeInspected: '',
        pinCodesAsPrimaryIE: [],
        placeOfInspectionPrimaryIE: [],
        pinCodesAsAlternateIE: [],
        placeOfInspectionSecondaryIE: [],

        // Section 2: Controlling Manager Fields
        cmEmpCode: '',
        controllingManager: '',

        // Section 3: Additional Fields
        rrio: '',
        currentCityOfPosting: '',
        metalStampNo: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="ie-fields-form">
            <form onSubmit={handleSubmit}>
                {/* Section 1: Inspection Engineer Fields */}
                <div className="form-section">
                    <h3 className="section-title">Inspection Engineer Fields</h3>
                    <table className="fields-table">
                        <thead>
                            <tr>
                                <th>Fields Name</th>
                                <th>Data Type</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="field-name">System Generated Emp. Code</td>
                                <td className="data-type">String</td>
                                <td className="remarks">Auto-generated</td>
                            </tr>
                            <tr>
                                <td className="field-name">Product to Be Inspected</td>
                                <td className="data-type">String</td>
                                <td className="remarks">
                                    <input
                                        type="text"
                                        name="productToBeInspected"
                                        value={formData.productToBeInspected}
                                        onChange={handleInputChange}
                                        placeholder="Enter product"
                                        className="form-control"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="field-name">Pin Codes as Primary IE</td>
                                <td className="data-type">Multiple Selected Dropdown</td>
                                <td className="remarks">
                                    <input
                                        type="text"
                                        name="pinCodesAsPrimaryIE"
                                        value={formData.pinCodesAsPrimaryIE}
                                        onChange={handleInputChange}
                                        placeholder="Select pin codes"
                                        className="form-control"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="field-name">Place of Inspection as Primary IE</td>
                                <td className="data-type">Multiple Place of Inspection</td>
                                <td className="remarks">
                                    <input
                                        type="text"
                                        name="placeOfInspectionPrimaryIE"
                                        value={formData.placeOfInspectionPrimaryIE}
                                        onChange={handleInputChange}
                                        placeholder="Select places"
                                        className="form-control"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="field-name">Pin Codes as Alternate IE</td>
                                <td className="data-type">Multiple Selected Dropdown</td>
                                <td className="remarks">
                                    <input
                                        type="text"
                                        name="pinCodesAsAlternateIE"
                                        value={formData.pinCodesAsAlternateIE}
                                        onChange={handleInputChange}
                                        placeholder="Select pin codes"
                                        className="form-control"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="field-name">Place of Inspection as Secondary IE</td>
                                <td className="data-type">Multiple Place of Inspection</td>
                                <td className="remarks">
                                    <input
                                        type="text"
                                        name="placeOfInspectionSecondaryIE"
                                        value={formData.placeOfInspectionSecondaryIE}
                                        onChange={handleInputChange}
                                        placeholder="Select places"
                                        className="form-control"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 2: Controlling Manager Fields */}
                <div className="form-section">
                    <h3 className="section-title">Controlling Manager Fields</h3>
                    <table className="fields-table">
                        <thead>
                            <tr>
                                <th>Fields Name</th>
                                <th>Data Type</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="field-name">System Generated Emp. Code</td>
                                <td className="data-type">String</td>
                                <td className="remarks">Auto-generated</td>
                            </tr>
                            <tr>
                                <td className="field-name">Controlling Manager</td>
                                <td className="data-type">String</td>
                                <td className="remarks">
                                    <input
                                        type="text"
                                        name="controllingManager"
                                        value={formData.controllingManager}
                                        onChange={handleInputChange}
                                        placeholder="Enter CM name"
                                        className="form-control"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        Save Fields
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
