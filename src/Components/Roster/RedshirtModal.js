import React from 'react';
import { Link } from 'react-router-dom';

import { GetModalClass } from '../../Constants/CSSClassHelper';
import routes from '../../Constants/routes';

const ConfirmRedshirtModal = (props) => {
    const { idx, player, viewMode } = props;
    const modalId = 'redshirtModal' + idx;
    const name = `${player.Position} ${player.FirstName} ${player.LastName}`;

    const confirmChange = () => {
        return props.setRedshirtStatus(player);
    };
    const modalClass = GetModalClass(viewMode);

    return (
        <div
            className="modal fade"
            id={modalId}
            tabIndex="-1"
            aria-labelledby="redshirtModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className={modalClass}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="redshirtModalLabel">
                            Confirm Redshirt?
                        </h4>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="row g-2 gy-2 mb-2">
                            WARNING: Once a redshirt has been placed on{' '}
                            <strong>{name}</strong>, they cannot be on your
                            depth chart. You will not be able to remove the
                            redshirt from this player.
                        </div>

                        <div className="row g-2 gy-2 mb-2">
                            If this player is already existing on your depth
                            chart,{' '}
                            <b>
                                please navigate to the depth chart page and swap
                                out the player immediately
                            </b>
                            . Refusal to do so will incur severe punishments to
                            your program both in the game and in recruiting.
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            No
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            data-bs-dismiss="modal"
                            onClick={confirmChange}
                        >
                            Yes
                        </button>
                        <Link
                            to={routes.DEPTHCHART}
                            type="button"
                            className="btn btn-danger"
                            data-bs-dismiss="modal"
                            onClick={confirmChange}
                        >
                            Yes and Navigate me to the Depth Chart Please
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmRedshirtModal;
