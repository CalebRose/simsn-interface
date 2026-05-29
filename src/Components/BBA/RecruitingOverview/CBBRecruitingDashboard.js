import React, { useEffect } from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
import toast from 'react-hot-toast';
import CBBDashboardPlayerRow from './CBBDashboardPlayerRow';
import BBAPlayerService from '../../../_Services/simNBA/BBAPlayerService';
import BBARecruitingService from '../../../_Services/simNBA/BBARecruitingService';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
    CountryList,
    LetterGradesList,
    BBPositionList,
    SimpleLetterGrades,
    StarsList,
    StatesList
} from '../../../Constants/BBAConstants';
import EasterEggService from '../../../_Services/simFBA/EasterEggService';
import { GetBBallCollusionStatements } from '../../../Constants/CollusionStatements';
import { MapOptions, MapObjOptions } from '../../../_Utility/filterHelper';
import { useMediaQuery } from 'react-responsive';
import routes from '../../../Constants/routes';
import { Link } from 'react-router-dom';
import CBBRankingsModal from './CBBRankingsModal';
import { CheckRegion, CheckState } from '../../../_Utility/CBBRecruitingHelper';
import {
    ConductSortForCBBOverview,
    GetDefaultOrderForCBBOverview,
    PickFromArray
} from '../../../_Utility/utilHelper';
import CBBDashboardMobileRow from './CBBDashboardMobileRow';
import RecruitingClassModal from '../../_Common/RecruitingClassModal';
import { GetTableHoverClass } from '../../../Constants/CSSClassHelper';
import { Spinner } from '../../_Common/Spinner';
import { RecruitingLoadMessages } from '../../../Constants/CommonConstants';

const CBBRecruitingDashboard = ({
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
    let playerService = new BBAPlayerService();
    let _recruitingService = new BBARecruitingService();
    let _easterEggService = new EasterEggService();

    // Hooks
    const positions = MapObjOptions(BBPositionList);
    const states = MapOptions(StatesList);
    const countries = MapOptions(CountryList);
    const letterGrades = MapOptions(LetterGradesList);
    const simpleLetterGrades = MapOptions(SimpleLetterGrades);
    const statusOptions = MapOptions([
        'Not Ready',
        'Hearing Offers',
        'Narrowing Down Offers',
        'Finalizing Decisions',
        'Ready to Sign',
        'Signed'
    ]);
    const stars = MapOptions(StarsList);
    const [selectedStates, setSelectedStates] = React.useState('');
    const [selectedCountries, setSelectedCountries] = React.useState('');
    const [selectedPositions, setPositions] = React.useState('');
    const [selectedStatuses, setStatuses] = React.useState('');
    const [selectedOverallGrades, setOverallGrades] = React.useState('');
    const [selectedPotentialGrades, setPotentialGrades] = React.useState('');
    const [selectedStars, setStars] = React.useState('');
    const [recruits, setRecruits] = React.useState([]);
    const [filteredRecruits, setFilteredRecruits] = React.useState([]);
    const [viewableRecruits, setViewableRecruits] = React.useState([]);
    const [count, setCount] = React.useState(100);
    const [recruitingProfile, setRecruitingProfile] = React.useState({});
    const [crootMap, setCrootMap] = React.useState({});
    const [viewWidth, setViewWidth] = React.useState(window.innerWidth);
    const [showCollusionButton, setShowCollusionButton] = React.useState(true);
    const [teamProfiles, setTeamProfiles] = React.useState([]);
    const [sort, setSort] = React.useState('Rank');
    const [isAsc, setIsAsc] = React.useState(false);
    const [loadMessage] = React.useState(() =>
        PickFromArray(RecruitingLoadMessages)
    );
    const luckyTeam = Math.floor(Math.random() * (20 - 1) + 1);
    const tableHoverClass = GetTableHoverClass(viewMode);

    // For mobile
    React.useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    const isMobile = useMediaQuery({ query: `(max-width:851px)` });

    // Static Data
    const filterCroots = (recruits) => {
        let fr = [...recruits];
        if (fr.length > 0) {
            if (selectedStates.length > 0) {
                fr = fr.filter((x) => selectedStates.includes(x.State));
            }
            if (selectedCountries.length > 0) {
                fr = fr.filter((x) => selectedCountries.includes(x.Country));
            }

            if (selectedPositions.length > 0) {
                fr = fr.filter((x) => selectedPositions.includes(x.Position));
            }

            if (selectedPotentialGrades.length > 0) {
                fr = fr.filter((x) =>
                    selectedPotentialGrades.includes(x.PotentialGrade)
                );
            }

            if (selectedOverallGrades.length > 0) {
                fr = fr.filter((x) =>
                    selectedOverallGrades.includes(x.OverallGrade)
                );
            }

            if (selectedStars.length > 0) {
                fr = fr.filter((x) => selectedStars.includes(x.Stars));
            }
            if (selectedStatuses.length > 0) {
                fr = fr.filter((x) =>
                    selectedStatuses.includes(x.SigningStatus)
                );
            }
        }

        return fr;
    };

    // UseEffects
    useEffect(() => {
        if (currentUser) {
            getCroots();
            getProfile();
            GetTeamProfiles();
        }
    }, [currentUser]);

    useEffect(() => {
        const fc = filterCroots(recruits);
        if (fc.length > 0) {
            const sc = ConductSortForCBBOverview([...fc], sort, isAsc);
            setFilteredRecruits(() => [...sc]);
            setViewableRecruits(() => [...sc.slice(0, count)]);
        }
    }, [
        selectedStates,
        selectedCountries,
        selectedPositions,
        selectedOverallGrades,
        selectedPotentialGrades,
        selectedStars,
        selectedStatuses,
        sort,
        isAsc
    ]);

    const getProfile = async () => {
        let res = await _recruitingService.GetTeamProfileForDashboard(
            currentUser.cbb_id
        );

        let profile = res.TeamProfile;

        // Get Map
        let recruits = profile.Recruits;
        let map = {};
        for (let i = 0; i < recruits.length; i++) {
            if (!recruits[i].RemovedFromBoard && recruits[i].Recruit !== null) {
                const keyCode =
                    recruits[i].Recruit.FirstName +
                    recruits[i].Recruit.LastName +
                    recruits[i].Recruit.Stars +
                    recruits[i].Recruit.State +
                    recruits[i].Recruit.Country;
                map[keyCode] = true;
            }
        }
        setCrootMap(() => map);
        setRecruitingProfile(profile);
    };

    const getCroots = async () => {
        if (recruits.length < 1) {
            let croots = await playerService.GetRecruits();
            if (croots.length > 0) {
                setRecruits(() => [...croots]);
                const fc = filterCroots(croots);
                setFilteredRecruits(() => [...fc]);
                setViewableRecruits(() => [...fc].slice(0, count));
            }
        }
    };

    const GetTeamProfiles = async () => {
        let response = await _recruitingService.GetAllTeamProfiles();

        setTeamProfiles(() => response);
    };

    // On Click Functions
    const ChangePositions = (options) => {
        const opts = [...options.map((x) => x.value)];
        setPositions(opts);
    };

    const ChangeStates = (options) => {
        const opts = [...options.map((x) => x.value)];
        setSelectedStates((x) => opts);
    };

    const ChangeCountries = (options) => {
        const opts = [...options.map((x) => x.value)];
        setSelectedCountries((x) => opts);
    };

    const ChangePotentialLetterGrades = (options) => {
        const opts = [...options.map((x) => x.value)];
        setPotentialGrades((x) => opts);
    };

    const ChangeOverallLetterGrades = (options) => {
        const opts = [...options.map((x) => x.value)];
        setOverallGrades((x) => opts);
    };

    const ChangeStars = (options) => {
        const opts = [...options.map((x) => x.value)];
        setStars(() => opts);
    };

    const ChangeRecruitingStatus = (options) => {
        const opts = [...options.map((x) => x.value)];
        setStatuses(() => opts);
    };

    const addPlayerToProfile = async (payload) => {
        let crootProfile = { ...recruitingProfile };
        let map = { ...crootMap };
        const hasStateBonus = CheckState(payload, crootProfile);
        const hasRegionBonus = CheckRegion(payload, crootProfile);

        let createRecruitPointsDto = {
            profileId: crootProfile.ID,
            playerId: payload.ID,
            seasonId: 0,
            team: currentUser.cbb_abbr,
            HasStateBonus: hasStateBonus,
            HasRegionBonus: hasRegionBonus
        };

        let newProfile = await _recruitingService.CreateRecruitingPointsProfile(
            createRecruitPointsDto
        );

        if (newProfile) {
            if (!crootProfile.Recruits) {
                crootProfile.Recruits = [];
            }
            // Add to local profile & crootmap
            const keyCode =
                payload.FirstName +
                payload.LastName +
                payload.Stars +
                payload.PotentialGrade +
                payload.Shooting2 +
                payload.Shooting3 +
                payload.State +
                payload.Country;
            map[keyCode] = true;
            crootProfile.Recruits.push(newProfile);
            toast.success('Successfully added croot to board!');

            setCrootMap(map);
            setRecruitingProfile(crootProfile);
            setFilteredRecruits(filteredRecruits);
        }
    };

    const CollusionButton = async () => {
        const randomInt = Math.floor(Math.random() * recruits.length - 1);
        if (randomInt >= recruits.length) {
            randomInt -= recruits.length - 1;
        }
        const randomCroot =
            randomInt > -1 && randomInt < recruits.length
                ? recruits[randomInt]
                : recruits[Math.floor(Math.random() * recruits.length - 1)];
        const message = GetBBallCollusionStatements(
            currentUser,
            cbbTeam,
            randomCroot
        );
        const dto = {
            WeekID: cbb_Timestamp.CollegeWeekID,
            SeasonID: cbb_Timestamp.CollegeSeasonID,
            Message: message
        };
        setShowCollusionButton(() => false);
        await _easterEggService.CollusionCallBBall(dto);
    };

    const Export = async () => {
        await _recruitingService.ExportCroots();
    };

    const loadRecords = () => {
        const currentRecruits = [...viewableRecruits];

        const newCount = [...currentRecruits].concat(
            [...filteredRecruits].slice(count, count + 100)
        );
        setViewableRecruits(() => newCount);
        setCount((x) => x + 100);
    };

    const loadMoreRecords = () => {
        setTimeout(() => loadRecords(), 500);
    };

    const ChangeSort = (value) => {
        const newSort = value;
        const isAscending = GetDefaultOrderForCBBOverview(newSort, sort, isAsc);
        setSort(() => newSort);
        setIsAsc(() => isAscending);
    };

    // Secondary Components

    return (
        <div className="container-fluid">
            <div className="justify-content-start">
                <h2>College Basketball Recruiting Overview</h2>
            </div>
            <div className="row mt-3">
                <div className="col-md-2 dashboard-sidebar">
                    <>
                        <div className="row gx-1 mt-3">
                            <div className="justify-content-start">
                                <h4>
                                    {cbbTeam ? cbbTeam.Team : 'Team'} Profile
                                </h4>
                                <Link
                                    to={routes.CBB_RECRUITING_BOARD}
                                    type="button"
                                    className="btn btn-primary btn-md me-2 shadow"
                                >
                                    Recruiting Board
                                </Link>
                            </div>
                        </div>
                        <div className="row gx-1 mt-3">
                            <div className="justify-content-center">
                                <h6>State, Region</h6>
                                {recruitingProfile.State},{' '}
                                {recruitingProfile.Region}
                            </div>
                        </div>
                        <div className="row gx-1 mt-3 justify-content-center">
                            <h6>Weekly Points Remaining</h6>
                            {recruitingProfile
                                ? recruitingProfile.WeeklyPoints -
                                  recruitingProfile.SpentPoints
                                : 'N/A'}
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
                    </>
                </div>
                <div className="col-md-10 px-md-4">
                    <div className="row mt-3 justify-content-between">
                        <div className="col-md-auto">
                            <h4 className="text-start align-middle">Filters</h4>
                        </div>
                        <div className="col-md-auto">
                            <h4 className="text-start align-middle me-2">
                                {cbb_Timestamp &&
                                    `Current Week ${cbb_Timestamp.CollegeWeek}`}
                            </h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-auto col-6">
                            <h5 className="text-start align-middle">States</h5>
                            <Select
                                options={states}
                                isMulti={true}
                                className="basic-multi-select btn-dropdown-width-team z-index-5"
                                classNamePrefix="select"
                                onChange={ChangeStates}
                            />
                        </div>
                        <div className="col-md-auto col-6">
                            <h5 className="text-start align-middle">
                                Countries
                            </h5>
                            <Select
                                options={countries}
                                isMulti={true}
                                className="basic-multi-select btn-dropdown-width-team z-index-5"
                                classNamePrefix="select"
                                onChange={ChangeCountries}
                            />
                        </div>
                        <div className="col-md-auto mb-1">
                            <h5 className="text-start align-middle">
                                Position
                            </h5>
                            <Select
                                options={positions}
                                isMulti={true}
                                className="basic-multi-select btn-dropdown-width-team z-index-6"
                                classNamePrefix="select"
                                onChange={ChangePositions}
                            />
                        </div>
                        <div className="col-auto">
                            <h5 className="text-start align-middle">
                                Export Croots
                            </h5>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={Export}
                            >
                                Export
                            </button>
                        </div>
                        {cbb_Timestamp &&
                            cbb_Timestamp.CollegeWeek > 4 &&
                            teamProfiles.length > 0 && (
                                <div className="col-auto">
                                    <h5 className="text-start align-middle">
                                        Recruiting Class
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#recruitingClassModal"
                                    >
                                        Class
                                    </button>
                                </div>
                            )}
                    </div>
                    <div className="row mt-2">
                        <div className="col-md-auto col-6">
                            <h5 className="text-start align-middle">
                                Potential Grade
                            </h5>
                            <Select
                                options={letterGrades}
                                isMulti={true}
                                className="basic-multi-select btn-dropdown-width-team z-index-3"
                                classNamePrefix="select"
                                onChange={ChangePotentialLetterGrades}
                            />
                        </div>
                        <div className="col-md-auto col-6">
                            <h5 className="text-start align-middle">Stars</h5>
                            <Select
                                options={stars}
                                isMulti={true}
                                className="basic-multi-select btn-dropdown-width-team z-index-1"
                                classNamePrefix="select"
                                onChange={ChangeStars}
                            />
                        </div>
                        <div className="col-md-auto mb-1">
                            <h5 className="text-start align-middle">Status</h5>
                            <Select
                                options={statusOptions}
                                isMulti={true}
                                className="basic-multi-select btn-dropdown-width-team z-index-1"
                                classNamePrefix="select"
                                onChange={ChangeRecruitingStatus}
                            />
                        </div>
                        {cbb_Timestamp && cbb_Timestamp.CollegeWeek > 4 && (
                            <>
                                <div className="col-auto">
                                    <h5 className="text-start align-middle">
                                        Team Rankings
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#rankingsModal"
                                    >
                                        Recruiting Rankings
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <CBBRankingsModal
                        teamProfiles={teamProfiles}
                        viewMode={viewMode}
                        retro={currentUser.IsRetro}
                    />
                    <RecruitingClassModal
                        teams={teamProfiles}
                        userTeam={cbbTeam}
                        viewMode={viewMode}
                        retro={currentUser.IsRetro}
                    />
                    <div
                        className={`row mt-2 dashboard-table-height${
                            viewMode === 'dark' ? '-dark' : ''
                        }`}
                    >
                        {cbb_Timestamp && !cbb_Timestamp.IsRecruitingLocked ? (
                            <InfiniteScroll
                                dataLength={viewableRecruits.length}
                                next={loadMoreRecords}
                                hasMore={true}
                                scrollThreshold={0.8}
                                height={570}
                                loader={
                                    <div className="row justify-content-center">
                                        Loading More Croots...
                                    </div>
                                }
                                endMessage={
                                    <div className="row justify-content-center">
                                        <h4>
                                            ...that's all the croots we have.
                                        </h4>
                                    </div>
                                }
                            >
                                {isMobile && viewableRecruits.length > 0 ? (
                                    viewableRecruits.map((x, idx) => (
                                        <CBBDashboardMobileRow
                                            key={x.ID}
                                            croot={x}
                                            idx={idx}
                                            add={addPlayerToProfile}
                                            map={crootMap}
                                            timestamp={cbb_Timestamp}
                                            theme={viewMode}
                                            retro={currentUser.IsRetro}
                                        />
                                    ))
                                ) : (
                                    <table className={tableHoverClass}>
                                        <thead
                                            style={{
                                                position: 'sticky',
                                                top: 0,
                                                backgroundColor:
                                                    viewMode === 'dark'
                                                        ? '#202020'
                                                        : 'white',
                                                zIndex: 3
                                            }}
                                        >
                                            <tr>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Rank')
                                                    }
                                                >
                                                    Rank
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Name')
                                                    }
                                                >
                                                    Name
                                                </th>
                                                <th scope="col">Pos</th>
                                                <th scope="col">Height</th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('State')
                                                    }
                                                >
                                                    State/Region
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Stars')
                                                    }
                                                >
                                                    Stars
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Finishing')
                                                    }
                                                >
                                                    Finishing
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Shooting2')
                                                    }
                                                >
                                                    2pt.
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Shooting3')
                                                    }
                                                >
                                                    3pt.
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('FreeThrow')
                                                    }
                                                >
                                                    FT
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Ballwork')
                                                    }
                                                >
                                                    Ballwork
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort('Rebounding')
                                                    }
                                                >
                                                    Rebounding
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort(
                                                            'InteriorDefense'
                                                        )
                                                    }
                                                >
                                                    Int. Defense
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort(
                                                            'PerimeterDefense'
                                                        )
                                                    }
                                                >
                                                    Per. Defense
                                                </th>
                                                <th
                                                    scope="col"
                                                    onClick={() =>
                                                        ChangeSort(
                                                            'PotentialGrade'
                                                        )
                                                    }
                                                >
                                                    Potential
                                                </th>
                                                <th scope="col">Status</th>
                                                <th scope="col">
                                                    Leading Teams
                                                </th>
                                                <th scope="col">Add</th>
                                            </tr>
                                        </thead>
                                        <tbody className="overflow-auto">
                                            {viewableRecruits.length > 0 &&
                                                viewableRecruits.map(
                                                    (x, idx) => (
                                                        <CBBDashboardPlayerRow
                                                            key={x.ID}
                                                            player={x}
                                                            idx={idx}
                                                            rank={idx + 1}
                                                            map={crootMap}
                                                            timestamp={
                                                                cbb_Timestamp
                                                            }
                                                            add={
                                                                addPlayerToProfile
                                                            }
                                                            viewMode={viewMode}
                                                            retro={
                                                                currentUser.IsRetro
                                                            }
                                                        />
                                                    )
                                                )}
                                        </tbody>
                                    </table>
                                )}
                            </InfiniteScroll>
                        ) : (
                            <>
                                <div className="row justify-content-center mt-3 mb-2">
                                    {loadMessage}
                                </div>

                                <div className="row justify-content-center pt-2 mt-4 mb-2">
                                    <Spinner />
                                </div>
                            </>
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

export default connect(mapStateToProps)(CBBRecruitingDashboard);
