import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import BBARequestService from '../../../../_Services/simNBA/BBARequestService';
import { NBARequestRow } from './NBARequestRow';
import { updateUserByUsername } from '../../../../Firebase/firestoreHelper';

const NBAApproveRequests = ({ currentUser }) => {
    // State
    const [requests, setRequests] = React.useState([]);
    const _requestService = new BBARequestService();
    // Use Effects Begin
    // Get Requests
    useEffect(() => {
        if (currentUser) {
            getRequests();
        }
    }, [currentUser]);

    // Use Effects End
    const getRequests = async () => {
        let requests = await _requestService.GetNBATeamRequests();
        setRequests(() => requests);
    };

    // Click Functions
    const approveRequest = async (payload, role) => {
        try {
            // DB request for Request
            const requestDTO = {
                ID: payload.ID,
                Username: payload.Username,
                NBATeamID: payload.NBATeamID,
                NBATeam: payload.NBATeam,
                NBATeamAbbreviation: payload.NBATeamAbbreviation,
                IsOwner: payload.IsOwner,
                IsManager: payload.IsManager,
                IsCoach: payload.IsCoach,
                IsAssistant: payload.IsAssistant,
                IsApproved: true
            };

            let res = await _requestService.ApproveNBARequest(requestDTO);

            if (res.ok) {
                console.log(
                    'Approved Request:',
                    payload.reqId + ' ' + payload.Team + ' ' + payload.Username
                );
                console.log(
                    payload.Username + ' is now assigned to ' + payload.Team
                );
            } else {
                throw ('HTTP-Error: Approval incomplete', res.status);
            }

            const firebasePayload = {
                NBATeamID: payload.NBATeamID,
                NBATeam: payload.NBATeam,
                NBATeamAbbreviation: payload.NBATeamAbbreviation,
                NBARole: role,
                username: payload.Username
            };

            // Firebase Call
            updateUserByUsername(payload.Username, firebasePayload);
            console.log('Firebase Updated');

            // Filter Requests
            const filterRequests = requests.filter(
                (x) => x.ID !== payload.reqId
            );
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
        const dto = {
            ID: payload.ID,
            Username: payload.Username,
            NBATeamID: payload.NBATeamID,
            NBATeam: payload.NBATeam,
            NBATeamAbbreviation: payload.NBATeamAbbreviation,
            IsOwner: payload.IsOwner,
            IsManager: payload.IsManager,
            IsCoach: payload.IsCoach,
            IsAssistant: payload.IsAssistant
        };

        let res = await _requestService.RejectNBARequest(dto);

        if (res.ok) {
            console.log('Rejected Request:', payload.reqId);
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
                    <h2 className="title is-3">SimNBA Approve Requests</h2>
                    <div className="availableScrollbar available-ui-height availableTeams">
                        <div className="table-wrapper dTable">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            <abbr>Team</abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr>Role</abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr title="User">User</abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr title="Approve">Approve</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Reject">Reject</abbr>
                                        </th>
                                    </tr>
                                </thead>
                                <tfoot>
                                    <tr>
                                        <th scope="col">
                                            <abbr>Team</abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr>Role</abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr title="User">User</abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr title="Approve">Approve</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Reject">Reject</abbr>
                                        </th>
                                    </tr>
                                </tfoot>
                                <tbody>
                                    {requests !== undefined &&
                                    requests !== null &&
                                    requests.length > 0
                                        ? requests.map((x, i) => {
                                              return (
                                                  <NBARequestRow
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
    return currentUser.bba_roleID !== 'Admin' ? <InvalidUser /> : <AdminUI />;
};
const mapStateToProps = ({ user: { currentUser } }) => ({
    currentUser
});

export default connect(mapStateToProps)(NBAApproveRequests);
