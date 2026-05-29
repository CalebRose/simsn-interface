import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../Firebase/firebase';
import routes from '../../Constants/routes';
// Redux
import { connect } from 'react-redux';
import { setCurrentUser } from '../../Redux/user/user.actions';
import { InboxModal } from '../_Common/ModalComponents';

const AuthorizedUser = ({ user, setCurrentUser, inbox }) => {
    const [unreadNoti, setUnreadNoti] = useState(false);
    var FBAdmin = () => {
        return (
            <li className="nav-item dropdown">
                <a
                    className="nav-link dropdown-toggle"
                    id="navbarDropdownMenuLink"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <span className="glyphicon glyphicon-info-sign"></span>
                    Football Admin <span className="caret"></span>
                </a>
                <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                >
                    <li className="dropdown-item">
                        <Link to={routes.MANAGE_SIM} className="dropdown-item">
                            Manage Sim <span className="caret"></span>
                        </Link>
                    </li>
                    <li>
                        <hr className="navbar-divider"></hr>
                    </li>
                    <li className="dropdown-item">
                        <Link
                            to={routes.MANAGE_USERS}
                            className="dropdown-item"
                        >
                            Manage Teams <span className="caret"></span>
                        </Link>
                    </li>
                    <li className="dropdown-item">
                        <Link to={routes.APPROVE} className="dropdown-item">
                            Approve Requests <span className="caret"></span>
                        </Link>
                    </li>
                    <li className="dropdown-item">
                        <Link to={routes.APPROVE_NFL} className="dropdown-item">
                            Approve NFL Requests <span className="caret"></span>
                        </Link>
                    </li>
                    <li className="dropdown-item">
                        <Link
                            to={routes.NFL_ADMIN_TRADE}
                            className="dropdown-item"
                        >
                            NFL Trade Portal <span className="caret"></span>
                        </Link>
                    </li>
                </ul>
            </li>
        );
    };

    const BBAdmin = () => {
        return (
            <li className="nav-item dropdown">
                <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdownMenuLink"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <span className="glyphicon glyphicon-info-sign" />
                    Basketball Admin <span className="caret" />
                </a>
                <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                >
                    <li className="dropdown-item">
                        <Link to={routes.BBA_ADMIN} className="dropdown-item">
                            Manage Sim <span className="caret" />
                        </Link>
                    </li>
                    <li>
                        <hr className="navbar-divider" />
                    </li>
                    <li className="dropdown-item">
                        <Link to={routes.BBA_USERS} className="dropdown-item">
                            Manage Teams <span className="caret" />
                        </Link>
                    </li>
                    <li className="dropdown-item">
                        <Link to={routes.BBA_APPROVE} className="dropdown-item">
                            Approve Requests <span className="caret" />
                        </Link>
                    </li>
                    <li className="dropdown-item">
                        <Link to={routes.NBA_APPROVE} className="dropdown-item">
                            Approve NBA Requests <span className="caret" />
                        </Link>
                    </li>
                    <li className="dropdown-item">
                        <Link
                            to={routes.NBA_ADMIN_TRADE}
                            className="dropdown-item"
                        >
                            NBA Trade Portal <span className="caret" />
                        </Link>
                    </li>
                </ul>
            </li>
        );
    };

    const logout = () => {
        auth.signOut();
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    useEffect(() => {
        const {
            cfbNotifications,
            nflNotifications,
            cbbNotifications,
            nbaNotifications
        } = inbox;
        let unread = false;

        for (let i = 0; i < cfbNotifications.length; i++) {
            const noti = cfbNotifications[i];
            if (!noti.IsRead) {
                unread = true;
                setUnreadNoti(() => true);
                break;
            }
        }
        if (unread) return;
        for (let i = 0; i < nflNotifications.length; i++) {
            const noti = nflNotifications[i];
            if (!noti.IsRead) {
                unread = true;
                setUnreadNoti(() => true);
                break;
            }
        }
        if (unread) return;
        for (let i = 0; i < cbbNotifications.length; i++) {
            const noti = cbbNotifications[i];
            if (!noti.IsRead) {
                unread = true;
                setUnreadNoti(() => true);
                break;
            }
        }
        if (unread) return;
        for (let i = 0; i < nbaNotifications.length; i++) {
            const noti = nbaNotifications[i];
            if (!noti.IsRead) {
                setUnreadNoti(() => true);
                break;
            }
        }
    }, [inbox]);

    return (
        <ul className="navbar-nav justify-content-end">
            {user && user.bba_roleID === 'Admin' ? <BBAdmin /> : ''}
            {user && user.roleID === 'Admin' ? <FBAdmin /> : ''}
            <li className="nav-item">
                <Link className="nav-link" to={routes.USER}>
                    <span className="glyphicon glyphicon-user"></span>
                    {user.username}
                </Link>
            </li>
            <li className="nav-item">
                <a
                    className="nav-link"
                    href="https://calebrose.io/simsn-interface-v2/"
                    target="_blank"
                >
                    Interface 2.0
                </a>
            </li>
            <li className="nav-item">
                <a
                    className="nav-link"
                    href="https://discord.gg/q46vwZ83RH"
                    target="_blank"
                >
                    Discord
                </a>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to={routes.LANDING} onClick={logout}>
                    <span className="primary fas fa-sign-out-alt"></span> Log
                    Out
                </Link>
            </li>
        </ul>
    );
};

const mapDispatchToProps = (dispatch) => ({
    setCurrentUser: (user) => dispatch(setCurrentUser(user))
});

export default connect(null, mapDispatchToProps)(AuthorizedUser);
