import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import acronyms from '../../Constants/acronyms';
import FBALandingPageService from '../../_Services/simFBA/FBALandingPageService';
import FBAScheduleService from '../../_Services/simFBA/FBAScheduleService';
import FBATeamService from '../../_Services/simFBA/FBATeamService';
import GameRow from './CFBGameRow';
import CFBStandingsModal from './CFBStandingsModal';
import { SeasonsList, SimCFB } from '../../Constants/CommonConstants';
import { SimFBAGameModal } from '../_Common/SimFBAGameModal';
import { SubmitCollegePollForm } from '../_Common/SubmitCollegePollModal';
import { CollegePollModal } from '../_Common/CollegePollModal';
import { useMediaQuery } from 'react-responsive';
import { FBAToggle } from '../_Common/SwitchToggle';

const SchedulePage = ({ cfbTeam, cfb_Timestamp, viewMode, currentUser }) => {
    // Services
    let _scheduleService = new FBAScheduleService();
    let _landingService = new FBALandingPageService();
    let _teamService = new FBATeamService();

    // Hooks
    const [weekOptions, setWeekOptions] = useState(null);
    const [teamOptions, setTeamOptions] = useState(null);
    const [seasons, setSeasons] = useState(SeasonsList);
    const [allGames, setAllGames] = useState([]);
    const [viewGames, setViewGames] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [thursdayCount, setThursdayCount] = useState(0);
    const [fridayCount, setFridayCount] = useState(0);
    const [satMornCount, setSatMornCount] = useState(0);
    const [satAfternoonCount, setSatAfternoonCount] = useState(0);
    const [satEveningCount, setSatEveningCount] = useState(0);
    const [satNightCount, setSatNightCount] = useState(0);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [viewAdmin, setViewAdmin] = useState(false);
    const [viewGame, setViewGame] = useState(null);
    const [viewType, setViewType] = useState('TEAM');
    const isAdmin = currentUser && currentUser.roleID === acronyms.ADMIN;
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:851px)` });
    const [exportType, setExportType] = useState('Thursday Night');

    // For mobile
    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    // Use Effects
    useEffect(() => {
        if (cfbTeam && cfb_Timestamp) {
            GetAllTeams();
            GetAllWeeks();
            GetAllGames(cfb_Timestamp.CollegeSeasonID);
        }
    }, [cfbTeam, cfb_Timestamp]);

    useEffect(() => {
        let gamesView = [];
        if (viewType === 'TEAM') {
            gamesView = [
                ...allGames.filter(
                    (x) =>
                        x.HomeTeam === selectedTeam ||
                        x.AwayTeam === selectedTeam
                )
            ];
        } else {
            gamesView = [...allGames.filter((x) => x.Week === selectedWeek)];
            let t = 0;
            let f = 0;
            let sm = 0;
            let sn = 0;
            let se = 0;
            let ad = 0;
            for (let i = 0; i < gamesView.length; i++) {
                const game = gamesView[i];
                if (game.TimeSlot === 'Thursday Night') t++;
                else if (game.TimeSlot === 'Friday Night') f++;
                else if (game.TimeSlot === 'Saturday Morning') sm++;
                else if (game.TimeSlot === 'Saturday Afternoon') sn++;
                else if (game.TimeSlot === 'Saturday Evening') se++;
                else if (game.TimeSlot === 'Saturday Night') ad++;
            }
            setThursdayCount(() => t);
            setFridayCount(() => f);
            setSatMornCount(() => sm);
            setSatAfternoonCount(() => sn);
            setSatEveningCount(() => se);
            setSatNightCount(() => ad);
        }

        setViewGames(() => gamesView);
    }, [selectedTeam, selectedWeek, viewType, allGames]);

    // API Functions
    const GetAllTeams = async () => {
        const response = await _teamService.GetAllCollegeTeams();

        const teamOptionForm = [
            ...response.map((x) => {
                return { label: x.TeamName, value: x.TeamAbbr };
            })
        ];
        setTeamOptions(() => teamOptionForm);
        setSelectedTeam(() => cfbTeam.TeamAbbr);
    };

    const GetAllWeeks = async () => {
        const weeksForm = [];
        for (let i = 0; i < 21; i++) {
            weeksForm.push({ label: i, value: i });
        }

        setWeekOptions(() => weeksForm);
    };

    const GetAllGames = async (seasonID) => {
        const response =
            await _scheduleService.GetAllCollegeGamesInASeason(seasonID);

        setAllGames(() => [...response]);
    };

    // Non-API Functions
    const ResetTeamViewOptions = () => {
        setSelectedTeam(() => cfbTeam.TeamAbbr);
    };
    const ResetWeekViewOptions = () => {
        setSelectedWeek(() => cfb_Timestamp.CollegeWeek);
    };

    // Click Functions
    const SelectTeamView = () => {
        ResetTeamViewOptions();
        setViewType(() => 'TEAM');
    };

    const SelectWeekView = () => {
        ResetWeekViewOptions();
        setViewType(() => 'WEEK');
    };

    const ChangeTeam = (options) => {
        const opts = options.value;
        setSelectedTeam(() => opts);
    };

    const ChangeWeek = (options) => {
        const opts = options.value;
        setSelectedWeek(() => opts);
    };

    const ChangeSeason = async (options) => {
        const opts = { label: options.label, value: options.value };
        setSelectedSeason(() => opts);
        await GetAllGames(options.value);
    };

    const ChangeTimeSlot = async (time, game) => {
        const dto = { GameID: game.ID, Timeslot: time, League: 'CFB' };
        const res = await _scheduleService.UpdateTimeslot(dto);
        // await _scheduleService.UpdateTimeslot(dto);
        const ag = [...allGames];
        const idx = ag.findIndex((x) => x.ID === game.ID);
        ag[idx] = {
            ...ag[idx],
            TimeSlot: time
            // Precip: res.Precip,
            // LowTemp: res.LowTemp,
            // HighTemp: res.HighTemp,
            // WindSpeed: res.WindSpeed,
            // WindCategory: res.WindCategory,
            // Cloud: res.Cloud
        };
        setAllGames(() => ag);
    };

    const SetGame = (game) => {
        setViewGame(() => game);
    };

    const toggleAdminView = () => {
        const av = viewAdmin;
        setViewAdmin(() => !av);
    };

    const ExportResults = async () => {
        const seasonID = Number(selectedSeason.value);
        let week = selectedWeek ? Number(selectedWeek) : 1;
        let startingWeekID = 0;
        if (seasonID === 1) {
            // Nothing
        } else if (seasonID === 2) {
            startingWeekID = 21;
        } else if (seasonID === 3) {
            startingWeekID = 43;
        } else if (seasonID === 4) {
            startingWeekID = 65;
        } else {
            startingWeekID = 88;
        }
        week += startingWeekID;

        await _scheduleService.ExportResults(
            seasonID,
            week,
            0,
            exportType,
            selectedWeek
        );
    };

    // Return
    return (
        <div className="container-fluid">
            <div className="justify-content-start">
                <h2>
                    SimSN {cfb_Timestamp.Season} Schedule
                    {viewType === 'WEEK' ? `, Week ${selectedWeek}` : ''}
                </h2>
                <div className="row">
                    <div className="col-md-2">
                        <h5>Schedule Filters</h5>
                        <div className="row mt-2 justify-content-center">
                            <div className="col-md-auto">
                                <div
                                    className="btn-group btn-group-lg"
                                    role="group"
                                    aria-label="ViewOptions"
                                >
                                    <button
                                        type="button"
                                        className={
                                            viewType === 'TEAM'
                                                ? 'btn btn-primary'
                                                : 'btn btn-secondary'
                                        }
                                        onClick={SelectTeamView}
                                    >
                                        By Team
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            viewType === 'WEEK'
                                                ? 'btn btn-primary'
                                                : 'btn btn-secondary'
                                        }
                                        onClick={SelectWeekView}
                                    >
                                        By Week
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="row mt-2 justify-content-center">
                                <div className="col-6">
                                    <FBAToggle
                                        change={toggleAdminView}
                                        label="View Games"
                                        value={viewAdmin}
                                        checkValue={viewAdmin}
                                    />
                                </div>
                            </div>
                        )}
                        {viewType === 'TEAM' ? (
                            <div className="row mt-2 mb-2">
                                <h6>Teams</h6>
                                <Select
                                    options={teamOptions}
                                    isMulti={false}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    onChange={ChangeTeam}
                                />
                            </div>
                        ) : (
                            <div className="row mt-2 mb-2">
                                <h6>Week</h6>
                                <Select
                                    options={weekOptions}
                                    isMulti={false}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    onChange={ChangeWeek}
                                />
                            </div>
                        )}
                        <div className="row mt-2 mb-2">
                            <h6 className="">Seasons</h6>
                            <Select
                                options={seasons}
                                isMulti={false}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={ChangeSeason}
                            />
                        </div>
                        <div className="row mt-2 justify-content-center gx-2">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#standingsModal"
                            >
                                Standings
                            </button>
                        </div>
                        <div className="row mt-2 mb-2 justify-content-center px-2">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#collegePollModal"
                            >
                                College Poll
                            </button>
                        </div>
                        {cfb_Timestamp.ThursdayGames && (
                            <div className="row mt-2 mb-2 justify-content-center px-2">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                >
                                    Submit College Poll
                                </button>
                            </div>
                        )}
                        <h5>Export Day of Week</h5>
                        <div className="row mt-2 justify-content-center">
                            <div className="col-md-auto">
                                <div
                                    className="btn-group btn-group-sm"
                                    role="group"
                                    aria-label="ViewOptions"
                                >
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${
                                            exportType === 'Thursday Night'
                                                ? 'btn-primary'
                                                : 'btn-danger'
                                        }`}
                                        onClick={() =>
                                            setExportType(
                                                () => 'Thursday Night'
                                            )
                                        }
                                    >
                                        Thur.
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${
                                            exportType === 'Friday Night'
                                                ? 'btn-primary'
                                                : 'btn-danger'
                                        }`}
                                        onClick={() =>
                                            setExportType(() => 'Friday Night')
                                        }
                                    >
                                        Fri.
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${
                                            exportType === 'Saturday Morning'
                                                ? 'btn-primary'
                                                : 'btn-danger'
                                        }`}
                                        onClick={() =>
                                            setExportType(
                                                () => 'Saturday Morning'
                                            )
                                        }
                                    >
                                        Sat. M.
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${
                                            exportType === 'Saturday Afternoon'
                                                ? 'btn-primary'
                                                : 'btn-danger'
                                        }`}
                                        onClick={() =>
                                            setExportType(
                                                () => 'Saturday Afternoon'
                                            )
                                        }
                                    >
                                        Sat. Noon.
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${
                                            exportType === 'Saturday Evening'
                                                ? 'btn-primary'
                                                : 'btn-danger'
                                        }`}
                                        onClick={() =>
                                            setExportType(
                                                () => 'Saturday Evening'
                                            )
                                        }
                                    >
                                        Sat. Eve.
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${
                                            exportType === 'Saturday Night'
                                                ? 'btn-primary'
                                                : 'btn-danger'
                                        }`}
                                        onClick={() =>
                                            setExportType(
                                                () => 'Saturday Night'
                                            )
                                        }
                                    >
                                        Sat. Night
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2 mb-2 justify-content-center px-2">
                            <h6 className="">Export</h6>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!selectedWeek || !selectedSeason}
                                onClick={ExportResults}
                            >
                                Export Week {selectedWeek} {exportType} Results
                            </button>
                        </div>
                    </div>
                    <SimFBAGameModal
                        game={viewGame}
                        isNFL={false}
                        isMobile={isMobile}
                    />
                    <CFBStandingsModal
                        ts={cfb_Timestamp}
                        viewMode={viewMode}
                        retro={currentUser.IsRetro}
                    />
                    <SubmitCollegePollForm
                        currentUser={currentUser}
                        timestamp={cfb_Timestamp}
                        isCFB={true}
                    />
                    <CollegePollModal
                        currentUser={currentUser}
                        timestamp={cfb_Timestamp}
                        seasonOptions={seasons}
                        league={SimCFB}
                        isCFB
                    />
                    <div className="col-md-10 px-md-4">
                        <div className="row mb-2">
                            <div className="col">
                                Thursday Games: {thursdayCount}
                            </div>
                            <div className="col">
                                Friday Games: {fridayCount}
                            </div>
                            <div className="col">
                                Sat. Morning Games: {satMornCount}
                            </div>
                            <div className="col">
                                Sat. Afternoon Games: {satAfternoonCount}
                            </div>
                            <div className="col">
                                Sat. Evening Games: {satEveningCount}
                            </div>
                            <div className="col">
                                After Dark Games: {satNightCount}
                            </div>
                        </div>
                        <div className="row mt-3 mb-5 justify-content-between">
                            {viewGames.length > 0 &&
                                viewGames.map((x, idx) => (
                                    <GameRow
                                        idx={idx}
                                        key={x.ID}
                                        game={x}
                                        viewMode={viewMode}
                                        isAdmin={viewAdmin}
                                        change={ChangeTimeSlot}
                                        ts={cfb_Timestamp}
                                        isNFL={false}
                                        SetGame={SetGame}
                                        retro={currentUser.IsRetro}
                                        viewType={viewType}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    cfbTeam: { cfbTeam },
    timestamp: { cfb_Timestamp },
    viewMode: { viewMode }
}) => ({
    currentUser,
    cfbTeam,
    cfb_Timestamp,
    viewMode
});

export default connect(mapStateToProps)(SchedulePage);
