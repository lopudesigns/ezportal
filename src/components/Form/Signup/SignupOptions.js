import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, Icon } from 'antd';
import { CHECKPOINTS } from '../../../../constants';
import './SignupOptions.less';

const SignupOptions = ({
    signupModalVisible,
    hideSignupModal,
    showSignupModal,
    handleFreeSignup,
    referrer,
    logCheckpoint,
}) => {
    const modalTitle = <FormattedMessage id="signup_options_modal_title" />;

    const capitalizeFirstLetter = string =>
        string.charAt(0).toUpperCase() + string.slice(1);

    const actionWithLog = (action, loggerFn, actionName) => () => {
        loggerFn(actionName);
        action();
    };

    return (
        <div>
            <h1>
                <FormattedMessage id="signup_options" />
            </h1>
            <p>
                {referrer && (
                    <FormattedMessage
                        id="signup_options_referrer"
                        values={{ referrer: capitalizeFirstLetter(referrer) }}
                    />
                )}
            </p>
            <p>
                <FormattedMessage id="signup_options_body_1" />
            </p>
            <p>
                <FormattedMessage id="signup_options_body_2" />
            </p>
            <p>
                <FormattedMessage id="signup_options_body_3" />
            </p>

            <div className="signup-options__buttons">
                <Button
                    type="primary"
                    htmlType="button"
                    onClick={handleFreeSignup}
                >
                    <FormattedMessage id="signup_options_button_free" />
                    <br />
                    <span className="btn-caveat">
                        <FormattedMessage id="signup_options_button_free_caveat" />
                    </span>
                </Button>
                <Button
                    type="default"
                    htmlType="button"
                    className="pay"
                    onClick={actionWithLog(
                        showSignupModal,
                        logCheckpoint,
                        CHECKPOINTS.paid_signup_options_modal_shown
                    )}
                >
                    <FormattedMessage id="signup_options_button_pay" />
                    <br />
                    <span className="btn-caveat">
                        <FormattedMessage id="signup_options_button_pay_caveat" />
                    </span>
                </Button>
            </div>

            <Modal
                title={modalTitle}
                visible={signupModalVisible}
                onCancel={hideSignupModal}
                footer={null}
            >
                <a
                    className="external-link"
                    href="https://blocktrades.us/create-ezira-account"
                    onClick={() => {
                        logCheckpoint(
                            CHECKPOINTS.paid_signup_clicked_blocktrades
                        );
                    }}
                >
                    <Button type="primary" ghost htmlType="button">
                        Blocktrades
                        <Icon type="link" />
                    </Button>
                </a>
                <p>
                    <FormattedMessage id="signup_options_blocktrades" />
                </p>

                <a
                    className="external-link"
                    href="https://anon.weyoume.io/"
                    onClick={() => {
                        logCheckpoint(
                            CHECKPOINTS.paid_signup_clicked_anon
                        );
                    }}
                >
                    <Button type="primary" ghost htmlType="button">
                        Anon
                        <Icon type="link" />
                    </Button>
                </a>
                <p>
                    <FormattedMessage id="signup_options_anon" />
                </p>
                <a
                    className="external-link"
                    href="https://alpha.weyoume.io/news/@timcliff/new-tool-from-busy-org-create-new-ezira-blockchain-accounts-with-steemconnect"
                    onClick={() => {
                        logCheckpoint(
                            CHECKPOINTS.paid_signup_clicked_native_auth
                        );
                    }}
                >
                    <Button type="primary" ghost htmlType="button">
                        Ezira
                        <Icon type="link" />
                    </Button>
                </a>
                <p>
                    <FormattedMessage id="signup_options_native_auth" />
                </p>
                <hr />
                <p className="modal-disclaimer">
                    <FormattedMessage id="signup_options_disclaimer" />
                </p>
            </Modal>
        </div>
    );
};

SignupOptions.propTypes = {
    signupModalVisible: PropTypes.bool.isRequired,
    hideSignupModal: PropTypes.func.isRequired,
    showSignupModal: PropTypes.func.isRequired,
    handleFreeSignup: PropTypes.func.isRequired,
    logCheckpoint: PropTypes.func.isRequired,
    referrer: PropTypes.string,
};

SignupOptions.defaultProps = {
    referrer: 'test.WeYouMe.auth',
};

export default SignupOptions;
