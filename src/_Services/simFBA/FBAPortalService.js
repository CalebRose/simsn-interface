import { saveAs } from 'file-saver';
import url from '../../Constants/url';
import BBAURL from '../../Constants/SimBBA_url';
import { GetCall, PostCall } from './FetchHelper';

export class PortalService {
    async GetTransferPortalPageData(isCFB, teamID) {
        let u = isCFB ? url : BBAURL;
        return await GetCall(`${u}portal/page/data/${teamID}`);
    }

    async GetTransferPlayerData(isCFB, playerID) {
        let u = isCFB ? url : BBAURL;
        return await GetCall(`${u}portal/player/scout/${playerID}`);
    }

    async GetCollegePromiseByPlayerID(isCFB, playerID, teamID) {
        let u = isCFB ? url : BBAURL;
        return await GetCall(`${u}portal/promise/player/${playerID}/${teamID}`);
    }

    async CreatePromise(isCFB, dto) {
        let u = isCFB ? url : BBAURL;
        return await PostCall(`${u}portal/promise/create`, dto);
    }

    async RemovePromise(isCFB, id) {
        let u = isCFB ? url : BBAURL;
        return await PostCall(`${u}portal/promise/remove/${id}`);
    }

    async CreatePortalProfile(isCFB, dto) {
        let u = isCFB ? url : BBAURL;
        return await PostCall(`${u}portal/profile/create`, dto);
    }

    async RemovePortalProfile(isCFB, id) {
        let u = isCFB ? url : BBAURL;
        return await GetCall(`${u}portal/profile/remove/${id}`);
    }

    async SaveBoard(isCFB, dto) {
        let u = isCFB ? url : BBAURL;
        return await PostCall(`${u}portal/saveboard`, dto);
    }

    async ExportPortal(isCFB) {
        let json;
        const baseURL = isCFB ? url : BBAURL;
        let fullURL = baseURL + 'portal/export/players';
        const league = isCFB ? 'CFB' : 'CBB';
        let response = await fetch(fullURL, {
            headers: {
                authorization: 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'text/csv'
            },
            responseType: 'blob'
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, `Official${league}PortalList.csv`));

        if (response.ok) {
            console.log('Portal export complete.');
        } else {
            alert('HTTP-Error:', response.status);
        }
        return json;
    }
}
