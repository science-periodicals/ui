import React from 'react';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import { getAgentId } from '@scipe/librarian';
import { getId, unprefix } from '@scipe/jsonld';
import Hyperlink from './hyperlink';
import Card from './card';
import UserBadge from './user-badge';
import ControlPanel from './control-panel';
import PaperButton from './paper-button';
import AutoAbridge from './auto-abridge';
import bemify from '../utils/bemify';
import Divider from './divider';
import PaperSelect from './paper-select';

export default class PeriodicalApplicationHandler extends React.Component {
  static propTypes = {
    user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    applyAction: PropTypes.shape({
      '@type': PropTypes.oneOf(['ApplyAction']).isRequired,
      actionStatus: PropTypes.oneOf(['ActiveActionStatus']).isRequired
    }).isRequired,
    disabled: PropTypes.bool,
    isProgressing: PropTypes.bool,
    onAction: PropTypes.func
  };

  static defaultProps = {
    onAction: noop
  };

  handleAccept = e => {
    const { user, applyAction, onAction } = this.props;
    onAction({
      '@type': 'AcceptAction',
      actionStatus: 'CompletedActionStatus',
      agent: getId(user),
      object: getId(applyAction)
    });
  };

  handleReject = e => {
    const { user, applyAction, onAction } = this.props;
    onAction({
      '@type': 'RejectAction',
      actionStatus: 'CompletedActionStatus',
      agent: getId(user),
      object: getId(applyAction)
    });
  };

  render() {
    const { applyAction, isProgressing, disabled } = this.props;

    const bem = bemify('periodical-application-handler');
    return (
      <Card className={bem``}>
        <header className={bem`__header`}>
          <div className={bem`__user-info`}>
            <UserBadge
              userId={getAgentId(applyAction.agent)}
              roleName={applyAction.agent.roleName}
              progressMode={isProgressing ? 'bounce' : 'none'}
              queued={true}
            />

            <AutoAbridge ellipsis={true}>
              <Hyperlink page="user" role={applyAction.agent}>
                {unprefix(getAgentId(applyAction.agent))}
              </Hyperlink>
            </AutoAbridge>

            <Hyperlink
              className={bem`__link`}
              page="user"
              role={applyAction.agent}
            >
              <Iconoclass iconName="exitToApp" size="18px" />
            </Hyperlink>
          </div>
        </header>

        <Divider />

        <div className={bem`__body`}>
          <div className={bem`__role`}>
            <PaperSelect
              label="role"
              name="roleName"
              value={applyAction.agent.roleName}
              disabled={true}
              readOnly={true}
            >
              <option value="editor">Editor</option>
              <option value="producer">Producer</option>
              <option value="reviewer">Reviewer</option>
            </PaperSelect>
          </div>

          <ControlPanel>
            <PaperButton
              disabled={disabled || isProgressing}
              onClick={this.handleReject}
            >
              Reject
            </PaperButton>
            <PaperButton
              disabled={disabled || isProgressing}
              onClick={this.handleAccept}
            >
              Accept
            </PaperButton>
          </ControlPanel>
        </div>
      </Card>
    );
  }
}
