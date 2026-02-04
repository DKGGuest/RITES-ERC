import React, { useState } from 'react';
import { StatusBadge, ExpandIcon } from './SharedComponents';
import { PO_SERIAL_LIST, INSPECTION_CALL_LIST, SHIFT_RESULTS } from '../../data/railwayBoardData';
import Pagination from '../Pagination';

// --- Level 3 & 4 Components ---

const Level4Table = ({ shifts, parentSerial, railway }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const count = shifts.length;
    const paginatedData = shifts.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return (
        <div className="nested-table-wrapper level-4">
            <div className="level-label level-4-label">Level 4: Inspection Call Wise List (Only for Process Inspection)</div>
            <div className="level-4-scroll-container">
                <table className="data-table complex-table nested-table level-4-table">
                    <thead>
                        {/* Row 1: Main Headers */}
                        <tr>
                            <th rowSpan="3">Date</th>
                            <th rowSpan="3">Shift</th>
                            <th rowSpan="3">Rly Name</th>
                            <th rowSpan="3">PO + Sr. No.</th>
                            <th rowSpan="3">Lot Number</th>
                            <th rowSpan="3">Total Accepted Qty</th>
                            <th rowSpan="3">Total Rejection Qty</th>

                            <th colSpan="2" className="process-header shearing">Shearing</th>
                            <th colSpan="2" className="process-header turning">Turning</th>
                            <th colSpan="2" className="process-header mpi">MPI</th>
                            <th colSpan="2" className="process-header forging">Forging</th>
                            <th colSpan="2" className="process-header quenching">Quenching</th>
                            <th colSpan="2" className="process-header tempering">Tempering</th>

                            {/* Rejection Classification Headers (Yellow) - Updated colSpan to 24 */}
                            <th colSpan="24" className="rejection-class-header">Rejection Classification</th>
                        </tr>

                        {/* Row 2: Sub Headers */}
                        <tr>
                            {/* Process Sub-headers */}
                            <th rowSpan="2" className="shearing-col" style={{ minWidth: '90px' }}>PROD QTY</th><th rowSpan="2" className="shearing-col" style={{ minWidth: '90px' }}>REJ QTY</th>
                            <th rowSpan="2" className="turning-col" style={{ minWidth: '90px' }}>PROD QTY</th><th rowSpan="2" className="turning-col" style={{ minWidth: '90px' }}>REJ QTY</th>
                            <th rowSpan="2" className="mpi-col" style={{ minWidth: '90px' }}>PROD QTY</th><th rowSpan="2" className="mpi-col" style={{ minWidth: '90px' }}>REJ QTY</th>
                            <th rowSpan="2" className="forging-col" style={{ minWidth: '90px' }}>PROD QTY</th><th rowSpan="2" className="forging-col" style={{ minWidth: '90px' }}>REJ QTY</th>
                            <th rowSpan="2" className="quenching-col" style={{ minWidth: '90px' }}>PROD QTY</th><th rowSpan="2" className="quenching-col" style={{ minWidth: '90px' }}>REJ QTY</th>
                            <th rowSpan="2" className="tempering-col" style={{ minWidth: '90px' }}>PROD QTY</th><th rowSpan="2" className="tempering-col" style={{ minWidth: '90px' }}>REJ QTY</th>

                            {/* Rejection Details Sub-headers */}
                            <th colSpan="4" className="shearing-col">Shearing Defects</th>
                            <th colSpan="3" className="turning-col">Turning Defects</th>
                            <th className="mpi-col">MPI Defects</th>
                            <th colSpan="4" className="forging-col">Forging Defects</th>
                            <th className="quenching-col">Quenching Defects</th>
                            <th colSpan="3" className="dim-col">Dimensional Rejection</th>
                            <th colSpan="3" className="visual-col">Visual Defects</th>
                            <th colSpan="3" className="testing-col">Testing Defects</th>
                            <th colSpan="2" className="finishing-col">Finishing Defects</th>
                        </tr>

                        {/* Row 3: Granular Defect Headers */}
                        <tr>
                            {/* Shearing */}
                            <th className="shearing-col" style={{ minWidth: '110px' }}>CUT LENGTH</th><th className="shearing-col">OVALITY</th><th className="shearing-col">SHARP EDGES</th><th className="shearing-col">CRACKS</th>
                            {/* Turning */}
                            <th className="turning-col" style={{ minWidth: '120px' }}>PARALLEL LEN</th><th className="turning-col">FULL TURNING</th><th className="turning-col">TURN DIA</th>
                            {/* MPI */}
                            <th className="mpi-col">MPI REJ</th>
                            {/* Forging */}
                            <th className="forging-col">FORGE TEMP</th><th className="forging-col">STABILISE</th><th className="forging-col">IMPROPER</th><th className="forging-col">FORGE DEFECT</th>
                            {/* Quenching */}
                            <th className="quenching-col">HARDNESS</th>
                            {/* Dimensional */}
                            <th className="dim-col">BOX GAUGE</th><th className="dim-col">BEARING AREA</th><th className="dim-col">FALLING</th>
                            {/* Visual */}
                            <th className="visual-col">SURFACE</th><th className="visual-col">EMBOSSING</th><th className="visual-col">MARKING</th>
                            {/* Testing */}
                            <th className="testing-col">TEMP HARD</th><th className="testing-col">TOE LOAD</th><th className="testing-col">WEIGHT</th>
                            {/* Finishing */}
                            <th className="finishing-col">PAINT ID</th><th className="finishing-col">COATING</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(shift => (
                            <tr key={shift.id} className="clickable-row">
                                <td>{new Date(shift.date).toLocaleDateString()}</td>
                                <td>{shift.shift}</td>
                                <td>{railway || '-'}</td>
                                <td>{parentSerial}</td>
                                <td>{shift.lot_no}</td>
                                <td>{shift.accepted_qty}</td>
                                <td>{shift.total_rej}</td>

                                {/* Process Data */}
                                <td>{shift.shearing?.prod}</td><td>{shift.shearing?.rej}</td>
                                <td>{shift.turning?.prod}</td><td>{shift.turning?.rej}</td>
                                <td>{shift.mpi?.prod}</td><td>{shift.mpi?.rej}</td>
                                <td>{shift.forging?.prod}</td><td>{shift.forging?.rej}</td>
                                <td>{shift.quenching?.prod}</td><td>{shift.quenching?.rej}</td>
                                <td>{shift.tempering?.prod}</td><td>{shift.tempering?.rej}</td>

                                {/* Defect Data (Mapped) */}
                                {/* Shearing */}
                                <td>{shift.defects?.shearing_len || 0}</td>
                                <td>0</td>{/* Ovality placeholder */}
                                <td>0</td>{/* Sharp placeholder */}
                                <td>0</td>{/* Cracked placeholder */}

                                {/* Turning */}
                                <td>0</td>{/* Parallel placeholder */}
                                <td>0</td>{/* Full placeholder */}
                                <td>{shift.defects?.turning_ovality || 0}</td>{/* Mapping ovality here for now */}

                                {/* MPI */}
                                <td>{shift.defects?.mpi || 0}</td>

                                {/* Forging */}
                                <td>{shift.defects?.forging_temp || 0}</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>{/* Forge Defect Placeholder */}

                                {/* Quenching */}
                                <td>{shift.defects?.quenching_hardness || 0}</td>

                                {/* Dimensional */}
                                <td>{shift.defects?.dimensional_box || 0}</td>
                                <td>0</td>
                                <td>0</td>

                                {/* Visual */}
                                <td>{shift.defects?.visual_surface || 0}</td>
                                <td>0</td>
                                <td>0</td>{/* Marking placeholder */}

                                {/* Testing */}
                                <td>0</td>{/* Temper Hardness placeholder */}
                                <td>{shift.defects?.testing_toe_load || 0}</td>
                                <td>0</td>{/* Weight placeholder */}

                                {/* Finishing */}
                                <td>0</td>{/* Paint ID placeholder */}
                                <td>0</td>{/* Coating placeholder */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {(
                <Pagination
                    theme="slate"
                    currentPage={page}
                    totalPages={Math.ceil(count / rowsPerPage)}
                    start={page * rowsPerPage}
                    end={Math.min((page + 1) * rowsPerPage, count)}
                    totalCount={count}
                    onPageChange={setPage}
                    rows={rowsPerPage}
                    onRowsChange={(r) => { setRowsPerPage(r); setPage(0); }}
                />
            )}
        </div>
    );
};

const Level3Row = ({ call, expandedCall, toggleCall, parentSerial, index }) => {
    const isExpanded = expandedCall === call.id;
    const isProcess = call.type === 'Process';
    const shifts = SHIFT_RESULTS[call.call_no] || [];

    return (
        <React.Fragment>
            <tr
                className={`clickable-row ${isExpanded ? 'expanded-row-parent' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleCall(call.id); }}
            >
                <td className="text-center">
                    {isProcess && <ExpandIcon isExpanded={isExpanded} isSubmenu={true} />}
                </td>
                <td>{index + 1}</td>
                <td className="font-medium text-teal" style={{ whiteSpace: 'nowrap' }}>{parentSerial}</td>
                <td className="font-medium text-teal">{call.call_no}</td>
                <td><StatusBadge status={call.stage} /></td>
                <td>{new Date(call.desired_date).toLocaleDateString()}</td>
                <td>{new Date(call.start_date).toLocaleDateString()}</td>
                <td>{new Date(call.end_date).toLocaleDateString()}</td>
                <td className="text-center">{call.visits}</td>
                <td className="text-right">{call.offered}</td>
                <td className="text-right">{call.accepted}</td>
                <td className="text-right">{call.balance}</td>
                <td className={call.rej_pct > 5 ? 'text-red' : ''}>{call.rej_pct}%</td>
                <td className="col-reason" title={call.reason}>{call.reason}</td>
                <td>{call.ic_number}</td>
            </tr>
            {isExpanded && isProcess && (
                <tr className="detail-row level-4-container">
                    <td colSpan="15">
                        <Level4Table shifts={shifts} parentSerial={parentSerial} />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

const Level3Table = ({ calls, expandedCall, toggleCall, parentSerial }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const count = calls.length;
    const paginatedData = calls.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return (
        <div className="nested-table-wrapper level-3">
            <div className="level-label">Level 3: Inspection Calls</div>
            <table className="data-table nested-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Sl No.</th>
                        <th>Rly-Sr.</th>
                        <th>Call</th>
                        <th>Stage</th>
                        <th>Des Date</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Visits</th>
                        <th>Off</th>
                        <th>Acc</th>
                        <th>Bal</th>
                        <th>Rej%</th>
                        <th>Reason</th>
                        <th>IC No</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((call, idx) => (
                        <Level3Row
                            key={call.id}
                            call={call}
                            index={(page * rowsPerPage) + idx}
                            parentSerial={parentSerial}
                            expandedCall={expandedCall}
                            toggleCall={toggleCall}
                        />
                    ))}
                </tbody>
            </table>
            {/* Level 3 Pagination - Only show if no call is expanded */}
            {!expandedCall && (
                <Pagination
                    theme="orange"
                    currentPage={page}
                    totalPages={Math.ceil(count / rowsPerPage)}
                    start={page * rowsPerPage}
                    end={Math.min((page + 1) * rowsPerPage, count)}
                    totalCount={count}
                    onPageChange={setPage}
                    rows={rowsPerPage}
                    onRowsChange={(r) => { setRowsPerPage(r); setPage(0); }}
                />
            )}
        </div>
    );
};

// --- Level 2 Component ---

const Level2Row = ({ row, index, expandedSerial, toggleSerial, expandedCall, toggleCall }) => {
    const isExpanded = expandedSerial === row.id;
    const calls = INSPECTION_CALL_LIST[row.rly_po_sr_no] || [];

    return (
        <React.Fragment>
            <tr
                className={`clickable-row ${isExpanded ? 'expanded-row-parent' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleSerial(row.id); }}
            >
                <td className="text-center">
                    <ExpandIcon isExpanded={isExpanded} isSubmenu={true} />
                </td>
                <td>{index + 1}</td>
                <td className="font-medium text-teal">{row.rly_po_sr_no}</td>
                <td title={row.consignee}>{row.consignee}</td>
                <td>{new Date(row.dp_date).toLocaleDateString()}</td>
                <td>{row.ext_dp_date ? new Date(row.ext_dp_date).toLocaleDateString() : '-'}</td>
                <td className="text-right">{row.qty.toLocaleString()}</td>
                <td className="text-right">{row.balance.toLocaleString()}</td>
                <td className="text-center">{row.ic_issued}</td>
                <td>{row.last_ic_date ? new Date(row.last_ic_date).toLocaleDateString() : '-'}</td>
                <td className="text-right">{row.rm_acc}</td>
                <td className={row.rm_rej_pct > 2 ? 'text-red' : ''}>{row.rm_rej_pct || 0}%</td>
                <td className="text-right">{row.proc_acc.toLocaleString()}</td>
                <td className={row.proc_rej_pct > 3 ? 'text-red' : ''}>{row.proc_rej_pct || 0}%</td>
                <td className="text-right">{row.final_acc.toLocaleString()}</td>
                <td className={row.final_rej_pct > 1 ? 'text-red' : ''}>{row.final_rej_pct || 0}%</td>
            </tr>
            {isExpanded && (
                <tr className="detail-row level-3-container">
                    <td colSpan="16">
                        <Level3Table
                            calls={calls}
                            parentSerial={row.rly_po_sr_no}
                            expandedCall={expandedCall}
                            toggleCall={toggleCall}
                        />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

const Level2Table = ({ serials, expandedSerial, toggleSerial, expandedCall, toggleCall }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const count = serials.length;
    const paginatedData = serials.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return (
        <div className="nested-table-wrapper">
            <div className="level-label">Level 2: PO Serial Details</div>
            <table className="data-table nested-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Sl No.</th>
                        <th>Rly-Sr. No.</th>
                        <th>Consignee</th>
                        <th>DP Date</th>
                        <th>Ext DP</th>
                        <th>Qty</th>
                        <th>Bal</th>
                        <th>ICs</th>
                        <th>Last IC</th>
                        <th>RM Acc</th>
                        <th>RM %</th>
                        <th>Proc Acc</th>
                        <th>Proc %</th>
                        <th>Final Acc</th>
                        <th>Final %</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((row, idx) => (
                        <Level2Row
                            key={row.id}
                            row={row}
                            index={(page * rowsPerPage) + idx}
                            expandedSerial={expandedSerial}
                            toggleSerial={toggleSerial}
                            expandedCall={expandedCall}
                            toggleCall={toggleCall}
                        />
                    ))}
                </tbody>
            </table>
            {/* Level 2 Pagination - Only show if no serial is expanded */}
            {!expandedSerial && (
                <Pagination
                    theme="blue"
                    currentPage={page}
                    totalPages={Math.ceil(count / rowsPerPage)}
                    start={page * rowsPerPage}
                    end={Math.min((page + 1) * rowsPerPage, count)}
                    totalCount={count}
                    onPageChange={setPage}
                    rows={rowsPerPage}
                    onRowsChange={(r) => { setRowsPerPage(r); setPage(0); }}
                />
            )}
        </div>
    );
};

// --- Level 1 Component ---

export const Level1Row = ({
    po,
    index,
    expandedPo,
    togglePo,
    expandedSerial,
    toggleSerial,
    expandedCall,
    toggleCall
}) => {
    const isExpanded = expandedPo === po.po_no;
    const serials = PO_SERIAL_LIST[po.po_no] || [];

    return (
        <React.Fragment>
            <tr
                className={`clickable-row ${isExpanded ? 'expanded-row-parent' : ''}`}
                onClick={() => togglePo(po.po_no)}
            >
                <td className="text-center">
                    <ExpandIcon isExpanded={isExpanded} />
                </td>
                <td>{index + 1}</td>
                <td><span className="badge-railway">{po.railway}</span></td>
                <td className="font-medium text-teal">{po.po_no}</td>
                <td>{new Date(po.po_date).toLocaleDateString()}</td>
                <td className="col-vendor" title={po.vendor}>{po.vendor}</td>
                <td>{po.region}</td>
                <td className="text-right">{po.po_qty.toLocaleString()}</td>
                <td className="text-right">{po.accepted_qty.toLocaleString()}</td>
                <td className="text-right">{po.balance_qty.toLocaleString()}</td>
                <td className={po.rm_rej > 2 ? 'text-red' : ''}>{po.rm_rej}%</td>
                <td className={po.process_rej > 3 ? 'text-red' : ''}>{po.process_rej}%</td>
                <td>{po.final_rej}%</td>
                <td><StatusBadge status={po.status} /></td>
            </tr>
            {isExpanded && (
                <tr className="detail-row level-2-container">
                    <td colSpan="14">
                        <Level2Table
                            serials={serials}
                            expandedSerial={expandedSerial}
                            toggleSerial={toggleSerial}
                            expandedCall={expandedCall}
                            toggleCall={toggleCall}
                        />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};
