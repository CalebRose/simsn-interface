import url from '../../Constants/url.js';
import { GetActionCall, GetCall, PostCall } from './FetchHelper.js';

export default class FBARequestService {
    async GetRequests() {
        let res = await fetch(url + 'requests/all/', {
            headers: {
                authorization: localStorage.getItem('token')
            }
        });
        let json;
        if (res.ok) {
            json = await res.json();
        } else {
            alert('HTTP-Error:', res.status);
        }
        return json;
    }

    async GetNFLRequests() {
        let res = await fetch(url + 'nfl/requests/all/', {
            headers: {
                authorization: localStorage.getItem('token')
            }
        });
        let json;
        if (res.ok) {
            json = await res.json();
        } else {
            alert('HTTP-Error:', res.status);
        }
        return json;
    }

    async ApproveRequest(payload) {
        let res = await fetch(url + 'requests/approve/', {
            headers: {
                authorization: localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({
                ID: payload.reqId,
                TeamID: payload.teamId,
                Username: payload.username,
                IsApproved: true
            })
        });
        return res;
    }

    async ApproveNFLRequest(payload) {
        let res = await fetch(url + 'nfl/requests/approve/', {
            headers: {
                authorization: localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return res;
    }

    async AssignTeam(payload) {
        let assignTeam = await fetch(url + 'teams/assign/' + payload.teamId, {
            headers: {
                authorization: localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                TeamID: payload.TeamID,
                Username: payload.Username,
                IsApproved: true
            })
        });

        return assignTeam;
    }

    async CreateTeamRequest(team, username) {
        let postRequest = await fetch(url + 'requests/create/', {
            headers: {
                authorization: localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                TeamID: team.id,
                Username: username,
                IsApproved: false
            })
        });

        return postRequest;
    }

    async CreateNFLTeamRequest(dto) {
        let postRequest = await fetch(url + 'nfl/requests/create/', {
            headers: {
                authorization: localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(dto)
        });

        return postRequest;
    }

    async RejectRequest(payload) {
        // DB Request
        return await PostCall(`${url}requests/reject/`, {
            ID: payload.ID,
            TeamID: payload.ReqID,
            Username: payload.Username,
            IsApproved: true
        });
    }

    async RejectNFLRequest(payload) {
        // DB Request
        let res = await fetch(url + 'nfl/requests/reject/', {
            headers: {
                authorization: localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                ID: payload.ID,
                TeamID: payload.ReqID,
                Username: payload.Username,
                IsApproved: false
            })
        });
        return res;
    }

    async RemoveUserFromTeamRequest(teamID) {
        await GetActionCall(`${url}requests/remove/${teamID}`);
    }

    async RemoveUserFromNFLTeamRequest(teamID, dto) {
        let res = await PostCall(url + 'nfl/requests/remove/' + teamID, dto);
        return res;
    }
}
