import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import NFLRequestRow from './RequestRow';
import FBARequestService from '../../../_Services/simFBA/FBARequestService';
import { updateUserByUsername } from '../../../Firebase/firestoreHelper';

const ApproveNFLRequests = ({ currentUser }) => {
    // State
    const user = useSelector((state) => state.user.currentUser);
    const [requests, setRequests] = React.useState([]);
    const requestService = new FBARequestService();
    // Use Effects Begin
    // Get Requests
    useEffect(() => {
        const getRequests = async () => {
            let requests = await requestService.GetNFLRequests();
            setRequests(requests);
        };
        if (user) {
            getRequests();
            console.log('REQUESTS RETRIEVED?');
        }
    }, [user]);

    // Use Effects End

    // Click Functions
    const approveRequest = async (payload, role) => {
        try {
            // DB request for Request
            const requestDTO = {
                ID: payload.ID,
                Username: payload.Username,
                NFLTeamID: payload.NFLTeamID,
                NFLTeam: payload.NFLTeam,
                NFLTeamAbbreviation: payload.NFLTeamAbbreviation,
                IsOwner: payload.IsOwner,
                IsManager: payload.IsManager,
                IsCoach: payload.IsCoach,
                IsAssistant: payload.IsAssistant,
                IsApproved: true
            };
            let res = await requestService.ApproveNFLRequest(requestDTO);

            if (res.ok) {
                console.log(
                    'Approved Request:',
                    payload.teamId + ' ' + payload.team + ' ' + payload.username
                );
            } else {
                throw ('HTTP-Error: Approval incomplete', res.status);
            }

            // Firebase Call
            const fbPayload = {
                NFLTeamID: payload.NFLTeamID,
                NFLTeam: payload.NFLTeam,
                NFLTeamAbbreviation: payload.NFLTeamAbbreviation,
                NFLRole: role,
                username: payload.Username
            };

            updateUserByUsername(payload.Username, fbPayload);
            console.log('Firebase Updated');
            // Filter Requests
            const filterRequests = requests.filter((x) => x.ID !== payload.ID);
            setRequests(filterRequests);
        } catch (err) {
            if (err) {
                console.log(err);
                alert(err);
            }
        }
    };

    const rejectRequest = async (payload) => {
        // DB Request
        let res = await requestService.RejectNFLRequest(payload);

        if (res.ok) {
            console.log('Rejected Request:', payload.ReqID);
        } else {
            throw ('HTTP-Error: Approval incomplete', res.status);
        }
        // Filter Requests
        const filterRequests = requests.filter((x) => x.ID !== payload.ID);
        setRequests(filterRequests);
    };

    // Click Functions End

    // Admin UI
    const AdminUI = () => {
        return (
            <div className="hero-body center">
                <div className="container is-fluid has-text-centered userInterface">
                    <h2 className="title is-3">Approve Requests</h2>
                    <div className="availableScrollbar available-ui-height availableTeams">
                        <div className="table-wrapper dTable">
                            <table className="table is-fullwidth is-hoverable is-truncated">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>
                                            <abbr>Team</abbr>
                                        </th>
                                        <th style={{ width: '120px' }}>
                                            <abbr>Role</abbr>
                                        </th>
                                        <th style={{ width: '80px' }}>
                                            <abbr title="User">User</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Approve">Approve</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Reject">Reject</abbr>
                                        </th>
                                    </tr>
                                </thead>
                                <tfoot>
                                    <tr>
                                        <th style={{ width: '200px' }}>
                                            <abbr>Team</abbr>
                                        </th>
                                        <th style={{ width: '120px' }}>
                                            <abbr>Conference</abbr>
                                        </th>
                                        <th style={{ width: '80px' }}>
                                            <abbr title="User">User</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Approve">Approve</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Reject">Reject</abbr>
                                        </th>
                                    </tr>
                                </tfoot>
                                <tbody>
                                    {requests && requests.length > 0
                                        ? requests.map((x, i) => {
                                              return (
                                                  <NFLRequestRow
                                                      key={i}
                                                      request={x}
                                                      approve={approveRequest}
                                                      reject={rejectRequest}
                                                  />
                                              );
                                          })
                                        : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const InvalidUser = () => {
        return (
            <div className="hero-body center">
                <div className="is-fluid has-text-centered">
                    <h2 className="subtitle is-3 availableText">
                        Please return to Landing Page immediately.
                    </h2>
                </div>
            </div>
        );
    };

    // Return
    return currentUser.roleID !== 'Admin' ? <InvalidUser /> : <AdminUI />;
};

const mapStateToProps = ({ user: { currentUser } }) => ({
    currentUser
});

export default connect(mapStateToProps)(ApproveNFLRequests);
