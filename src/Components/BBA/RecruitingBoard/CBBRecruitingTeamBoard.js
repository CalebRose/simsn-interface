import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import toast from 'react-hot-toast';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { GetTableHoverClass } from '../../../Constants/CSSClassHelper';
import routes from '../../../Constants/routes';
import BBARecruitingService from '../../../_Services/simNBA/BBARecruitingService';
import { Spinner } from '../../_Common/Spinner';
import CBBTeamDashboardMobileRow from './DashboardComponents/CBBTeamDashboardMobileRow';
import CBBTeamDashboardPlayerRow from './DashboardComponents/CBBTeamDashboardPlayerRow';
import { PickFromArray } from '../../../_Utility/utilHelper';
import { RecruitingLoadMessages } from '../../../Constants/CommonConstants';

const CBBRecruitingTeamBoard = ({
    currentUser,
    cbbTeam,
    cbb_Timestamp,
    viewMode
}) => {
    return (
        <>
            <div className="container-fluid mt-3">
                <h3>
                    Interface 1.0's Gameplan Page is officially closed. Please
                    navigate to Interface 2.0 in order to use the CBB Recruiting
                    page.
                </h3>
                <a
                    href="https://calebrose.io/simsn-interface-v2/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Link to SimSN Interface 2.0
                </a>
            </div>
        </>
    );
    // Services
    let _recruitingService = new BBARecruitingService();

    // Hooks
    const [recruitingProfile, setRecruitingProfile] = React.useState(null);
    const [recruits, setRecruits] = React.useState([]);
    const [isValid, setValidation] = React.useState(true);
    const savingMessage = 'Saving Recruiting Options...';
    const successMessage = 'Saved successfully!';
    const [viewWidth, setViewWidth] = React.useState(window.innerWidth);
    const [loadMessage] = React.useState(() =>
        PickFromArray(RecruitingLoadMessages)
    );
    const isMobile = useMediaQuery({ query: `(max-width:844px)` });
    const tableHoverClass = GetTableHoverClass(viewMode);

    React.useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    // useEffects
    useEffect(() => {
        if (currentUser) {
            getRecruitingProfile();
        }
    }, [currentUser]);

    useEffect(() => {
        if (recruits && recruits.length > 0) {
            checkValidation();
        }
    }, [recruits]);

    // Functions
    const getRecruitingProfile = async () => {
        let response = await _recruitingService.GetRecruitingProfile(
            currentUser.cbb_id
        );

        let profile = { ...response.TeamProfile };

        let recruits =
            profile !== undefined &&
            profile.Recruits !== null &&
            profile.Recruits.length > 0
                ? profile.Recruits
                : [];

        let filteredRecruits = recruits
            .filter((x) => !x.RemovedFromBoard)
            .sort((a, b) => {
                return a.IsSigned === b.IsSigned ? 0 : a.IsSigned ? 1 : -1;
            });
        setRecruitingProfile(() => profile);
        setRecruits(() => filteredRecruits);
    };

    const removeRecruitFromBoard = async (idx, player) => {
        //
        let res = await _recruitingService.RemovePlayerFromBoard(player);

        const recruitList = [...recruits].filter(
            (x) => x.RecruitID !== player.RecruitID
        );

        toast.success('Successfully removed player from board :(');

        setRecruits(() => recruitList);
    };

    const toggleScholarship = async (idx, recruitProfile) => {
        const scholarshipVal = !recruitProfile.Scholarship ? true : false;
        const revokedVal = !scholarshipVal ? true : false;
        const croots = [...recruits].map((x) => {
            return { ...x };
        });
        croots[idx].Scholarship = scholarshipVal;
        croots[idx].ScholarshipRevoked = revokedVal;

        const UpdateRecruitDto = {
            RecruitID: recruitProfile.RecruitID,
            RecruitPointsID: recruitProfile.ID,
            ProfileID: recruitProfile.ProfileID,
            Team: recruitingProfile.TeamAbbreviation,
            RewardScholarship: scholarshipVal,
            RevokeScholarship: revokedVal
        };

        const response =
            await _recruitingService.SendScholarshipToRecruit(UpdateRecruitDto);
        if (response.ok) {
            setRecruits(croots);
            const croot = croots[idx].Recruit;
            const teamProfile = { ...recruitingProfile };
            teamProfile.ScholarshipsAvailable = !revokedVal
                ? teamProfile.ScholarshipsAvailable + 1
                : teamProfile.ScholarshipsAvailable - 1;
            setRecruitingProfile(() => teamProfile);
            if (!revokedVal) {
                toast.success(
                    `Successfully Offered a Scholarship to ${croot.FirstName} ${croot.LastName}!`
                );
            } else {
                toast.error(
                    `${croot.FirstName} ${croot.LastName}'s scholarship has been revoked. You will not be able to recruit this player anymore.`
                );
            }
        }
    };

    const allocatePoints = (idx, event) => {
        let { value } = event.target;
        let recruitList = [...recruits];
        let pointsSpent = value;
        recruitList[idx] = {
            ...recruitList[idx],
            CurrentWeeksPoints: Number(pointsSpent)
        };
        setRecruits(() => recruitList);
    };

    const checkValidation = () => {
        if (
            recruits === null ||
            recruits.length === 0 ||
            recruitingProfile === null
        )
            return;
        let valid = true;
        let profile = { ...recruitingProfile };
        let croots = [...recruits];
        let currentPointsSpent = 0;
        let message = '';
        for (let i = 0; i < croots.length; i++) {
            let croot = croots[i];
            if (isNaN(croot.CurrentWeeksPoints)) croot.CurrentWeeksPoints = 0;
            if (croot.CurrentWeeksPoints < 0 || croot.CurrentWeeksPoints > 20) {
                valid = false;

                message = `ERROR! Recruit ${croot.Recruit.FirstName} ${croot.Recruit.LastName} must have a point allocation between 0 and 20 points.`;

                break;
            }
            currentPointsSpent += Number(croot.CurrentWeeksPoints);

            if (currentPointsSpent > profile.WeeklyPoints && valid) {
                valid = false;
            }
            if (!valid) {
                message = `Total Points Spent Exceeds Weekly Points for Team. Please remove ${
                    currentPointsSpent - profile.WeeklyPoints
                } points.`;
            }
        }
        profile.SpentPoints = currentPointsSpent;
        setRecruitingProfile(() => profile);
        if (!valid) {
            toast.error(message, { duration: 6000 });
        }
        setValidation(() => valid);
    };

    const SaveToast = () => {
        toast.promise(savePointAllocations(), {
            loading: savingMessage,
            success: successMessage,
            error: 'ERROR: Could not successfully save. Please reach out to admin'
        });
    };

    const savePointAllocations = async () => {
        if (!isValid) return;
        let profile = { ...recruitingProfile };
        let croots = [...recruits];
        let payload = {
            Profile: profile,
            Recruits: croots,
            TeamID: currentUser.cbb_id
        };

        let response = await _recruitingService.SaveRecruitingBoard(payload);

        if (response.ok) {
            profile.Recruits = croots;
            setRecruitingProfile(profile);
            setRecruits(croots);
            console.log('Saved successful for team ', payload.TeamID);
        } else {
            alert('HTTP-Error:', response.status);
        }
    };

    return (
        <div className="container-fluid mt-3">
            {/* Place Save Modal Here */}{' '}
            <div className="col-md-auto justify-content-start">
                <h2>{currentUser ? currentUser.cbb_team : 'Team'} Board</h2>
            </div>
            <div className="row">
                <div className="col-md-2 dashboard-sidebar">
                    <div className="row mt-3">
                        <div className="justify-content-start">
                            <h4>{cbbTeam ? cbbTeam.Team : 'Team'} Profile</h4>
                            <Link
                                to={routes.CBB_RECRUITING}
                                type="button"
                                className="btn btn-primary btn-md me-2 shadow"
                            >
                                Recruiting Overview
                            </Link>
                        </div>
                    </div>
                    <div className="row gx-1 mt-3">
                        <div className="justify-content-center">
                            <h6>State, Region</h6>
                            {recruitingProfile && recruitingProfile.State},{' '}
                            {recruitingProfile && recruitingProfile.Region}
                        </div>
                    </div>
                    <div className="row gx-1 mt-3 gap-2 justify-content-center">
                        <div className="col-auto">
                            <h6>Scholarships Available</h6>
                            {recruitingProfile
                                ? recruitingProfile.RecruitClassSize -
                                  recruitingProfile.TotalCommitments
                                : 'N/A'}
                        </div>
                        <div className="col-auto">
                            <h6>Offers Available</h6>
                            {recruitingProfile
                                ? recruitingProfile.ScholarshipsAvailable
                                : 'N/A'}
                        </div>
                    </div>
                    <div className="row gx-1 mt-3 gap-2 justify-content-center">
                        <h5>Ratings</h5>
                    </div>
                    <div className="row gx-1 mt-1 gap-2 justify-content-center">
                        <div className="col-auto">
                            <h6>ESPN</h6>
                            {recruitingProfile
                                ? recruitingProfile.ESPNScore
                                : 'N/A'}
                        </div>
                        <div className="col-auto">
                            <h6>Rivals</h6>
                            {recruitingProfile
                                ? recruitingProfile.RivalsScore
                                : 'N/A'}
                        </div>
                        <div className="col-auto">
                            <h6>247Sports</h6>
                            {recruitingProfile
                                ? recruitingProfile.Rank247Score
                                : 'N/A'}
                        </div>
                    </div>
                </div>
                <div className="col-md-10 px-md-4">
                    <div className="row">
                        <div className="col-md-auto ms-auto">
                            <div className="row justify-content-end">
                                <div className="col-md-auto ms-auto">
                                    <h4>
                                        Weekly Points:{' '}
                                        {recruitingProfile &&
                                            recruitingProfile.WeeklyPoints}
                                    </h4>
                                    <h4>
                                        Points Spent:{' '}
                                        {recruitingProfile &&
                                            recruitingProfile.SpentPoints}
                                    </h4>
                                </div>
                                <div className="col-md-auto ms-auto align-self-center">
                                    {isValid &&
                                    cbb_Timestamp &&
                                    !cbb_Timestamp.IsRecruitingLocked ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={SaveToast}
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <button className="btn btn-warning">
                                            Save
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`row mt-2 dashboard-table-height${
                            viewMode === 'dark' ? '-dark' : ''
                        }`}
                    >
                        {isMobile &&
                        cbb_Timestamp &&
                        !cbb_Timestamp.IsRecruitingLocked ? (
                            <>
                                {recruits !== undefined &&
                                    recruits !== null &&
                                    recruits.length > 0 &&
                                    recruits.map((x, idx) => (
                                        <CBBTeamDashboardMobileRow
                                            key={x.ID}
                                            idx={idx}
                                            recruitProfile={x}
                                            remove={removeRecruitFromBoard}
                                            toggleScholarship={
                                                toggleScholarship
                                            }
                                            changePoints={allocatePoints}
                                            theme={viewMode}
                                            retro={currentUser.IsRetro}
                                        />
                                    ))}
                            </>
                        ) : (
                            <table className={tableHoverClass}>
                                <thead>
                                    <tr>
                                        <th scope="col" abbr="Scholarship">
                                            Scholarship
                                        </th>
                                        <th scope="col">Pos</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Height</th>
                                        <th scope="col">State/Region</th>
                                        <th scope="col">Stars</th>
                                        <th scope="col">Fin.</th>
                                        <th scope="col">Sht. 2</th>
                                        <th scope="col">Sht. 3</th>
                                        <th scope="col">FT</th>
                                        <th scope="col">Bal.</th>
                                        <th scope="col">Reb.</th>
                                        <th scope="col">Int. Def.</th>
                                        <th scope="col">Per. Def.</th>
                                        <th scope="col">Pot.</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Leading Teams</th>
                                        <th scope="col" style={{ width: 125 }}>
                                            Add Points
                                        </th>
                                        <th scope="col">Total Points</th>
                                        <th scope="col">Remove</th>
                                    </tr>
                                </thead>
                                <tbody className="overflow-auto">
                                    {cbb_Timestamp &&
                                        !cbb_Timestamp.IsRecruitingLocked &&
                                        recruits !== undefined &&
                                        recruits !== null &&
                                        recruits &&
                                        recruits.length > 0 &&
                                        recruits.map((x, idx) => (
                                            <CBBTeamDashboardPlayerRow
                                                key={x.ID}
                                                player={x}
                                                idx={idx}
                                                remove={removeRecruitFromBoard}
                                                toggleScholarship={
                                                    toggleScholarship
                                                }
                                                changePoints={allocatePoints}
                                                viewMode={viewMode}
                                            />
                                        ))}
                                </tbody>
                            </table>
                        )}
                        {recruits === undefined ||
                            (recruits === null && (
                                <div className="row justify-content-center pt-2 mt-4 mb-2">
                                    <Spinner />
                                </div>
                            ))}
                        {recruits !== undefined &&
                            recruits !== null &&
                            recruits.length === 0 && (
                                <div className="row justify-content-center">
                                    Have you considered adding a croot to your
                                    team board?
                                </div>
                            )}
                        {cbb_Timestamp && cbb_Timestamp.IsRecruitingLocked && (
                            <div className="row justify-content-center">
                                {loadMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    cbbTeam: { cbbTeam },
    timestamp: { cbb_Timestamp },
    viewMode: { viewMode }
}) => ({
    currentUser,
    cbbTeam,
    cbb_Timestamp,
    viewMode
});

export default connect(mapStateToProps)(CBBRecruitingTeamBoard);
