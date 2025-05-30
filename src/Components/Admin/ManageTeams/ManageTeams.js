import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import TeamRow from './TeamRow';
import FBATeamService from '../../../_Services/simFBA/FBATeamService';
import FBARequestService from '../../../_Services/simFBA/FBARequestService';
import constants from '../../../Constants/acronyms';
import { updateUserByUsername } from '../../../Firebase/firestoreHelper';

const ManageTeams = ({ currentUser }) => {
    // State
    const user = useSelector((state) => state.user.currentUser);
    const [teams, setTeams] = React.useState([]);
    let teamService = new FBATeamService();
    let requestService = new FBARequestService();

    // Use Effects Begin
    useEffect(() => {
        const getCoachedTeams = async () => {
            let coachedTeams = await teamService.GetAllActiveCollegeTeams();
            setTeams(coachedTeams);
        };
        if (user) {
            getCoachedTeams();
        }
    }, [user]);

    // Use Effects End

    // Click Functions
    const revokeRequest = async (payload) => {
        // DB Request
        await requestService.RemoveUserFromTeamRequest(payload.reqId);

        console.log('Revoke Request:', payload.reqId);
        // Firebase Call
        const emptyObj = {
            username: payload.username,
            team: '',
            mascot: '',
            teamAbbr: '',
            teamId: null
        };
        updateUserByUsername(payload.username, emptyObj);

        console.log('Firebase Updated');

        // Filter Requests
        const filterTeams = [...teams].filter(
            (x) => x.Coach !== payload.username
        );

        setTeams(filterTeams);
    };

    // Admin UI
    const AdminUI = () => {
        return (
            <div className="hero-body center">
                <div className="container is-fluid has-text-centered userInterface">
                    <h2 className="title is-3">Manage Users and Teams</h2>
                    <div className="availableScrollbar available-ui-height availableTeams">
                        <div className="table-wrapper dTable">
                            <table className="table is-fullwidth is-hoverable is-truncated">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>
                                            <abbr>Team</abbr>
                                        </th>
                                        <th style={{ width: '80px' }}>
                                            <abbr title="User">User</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Conference">
                                                Conf.
                                            </abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Revoke Team">
                                                Revoke
                                            </abbr>
                                        </th>
                                    </tr>
                                </thead>
                                <tfoot>
                                    <tr>
                                        <th style={{ width: '120px' }}>
                                            <abbr>Team</abbr>
                                        </th>
                                        <th style={{ width: '80px' }}>
                                            <abbr title="User">User</abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Conference">
                                                Conf.
                                            </abbr>
                                        </th>
                                        <th style={{ width: '50px' }}>
                                            <abbr title="Revoke Team">
                                                Revoke
                                            </abbr>
                                        </th>
                                    </tr>
                                </tfoot>
                                <tbody>
                                    {teams.map((x, i) => {
                                        return (
                                            <TeamRow
                                                key={i}
                                                team={x}
                                                revoke={revokeRequest}
                                            />
                                        );
                                    })}
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
    return currentUser.roleID !== constants.ADMIN ? (
        <InvalidUser />
    ) : (
        <AdminUI />
    );
};

const mapStateToProps = ({ user: { currentUser } }) => ({
    currentUser
});

export default connect(mapStateToProps)(ManageTeams);
