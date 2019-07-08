import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Iconoclass from '@scipe/iconoclass';
import { getId } from '@scipe/jsonld';
import {
  TYPESETTING_SERVICE_TYPE,
  DOI_REGISTRATION_SERVICE_TYPE
} from '@scipe/librarian';
import BemTags from '../../utils/bem-tags';
import { API_LABELS } from '../../constants';
import { getIconNameFromSchema } from '../../utils/graph';
import PaperInput from '../paper-input';
import PaperTextarea from '../paper-textarea';
import { LayoutWrapRows, LayoutWrapItem } from '../layout-wrap-rows';
import Card from '../card';
import ControlPanel from '../control-panel';
import PaperButton from '../paper-button';
import withOnSubmit from '../../hoc/with-on-submit';
import CreateGraphActionEditorAgentEditor from './create-graph-action-editor-agent-editor';
import CreateGraphActionEditorAudienceEditor from './create-graph-action-editor-audience-editor';
import CreateGraphActionEditorEndorserEditor from './create-graph-action-editor-endorser-editor';
import CreateGraphActionEditorInstanceEditor from './create-graph-action-editor-instance-editor';
import CreateGraphActionEditorQuestionEditor from './create-graph-action-editor-question-editor';
import CreateGraphActionEditorServiceEditor from './create-graph-action-editor-service-editor';
import CreateGraphActionEditorApcEditor from './create-graph-action-editor-apc-editor';
import CreateGraphActionEditorContentRequirementEditor from './create-graph-action-editor-content-requirement-editor';

const ControlledPaperInput = withOnSubmit(PaperInput);
const ControlledPaperTextarea = withOnSubmit(PaperTextarea);

/**
 * Note `readOnly` is not needed here as the modal cannot be open in readonly mode.
 */
export default class CreateGraphActionEditorModal extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    nodeMap: PropTypes.object,
    periodical: PropTypes.object,
    action: PropTypes.object.isRequired,
    stageId: PropTypes.string.isRequired,
    productionStageId: PropTypes.string.isRequired,
    potentialServices: PropTypes.arrayOf(PropTypes.object),
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    potentialServices: []
  };

  handleChange = e => {
    const { nodeMap, onChange, action } = this.props;

    const value =
      e.target.name === 'expectedDuration'
        ? moment
            .duration()
            .add(parseInt(e.target.value, 10), 'd')
            .toISOString()
        : e.target.value;

    const nextNodeMap = Object.assign({}, nodeMap, {
      [getId(action)]: Object.assign({}, action, {
        [e.target.name]: value
      })
    });
    onChange(nextNodeMap);
  };

  render() {
    const {
      onClose,
      action,
      stageId,
      productionStageId,
      disabled,
      periodical,
      onChange,
      nodeMap,
      potentialServices
    } = this.props;

    const bem = BemTags();
    const agent = nodeMap[getId(action.agent)];

    const createReleaseActionPotentialServices = potentialServices.filter(
      service => service.serviceType === TYPESETTING_SERVICE_TYPE
    );

    const publishActionAddOnServices = potentialServices.filter(
      service => service.serviceType === DOI_REGISTRATION_SERVICE_TYPE
    );

    return (
      <Card className={bem`create-graph-action-editor-modal`}>
        <div className={bem`__contents`}>
          <header className={bem`__header`}>
            <Iconoclass iconName={getIconNameFromSchema(action)} round={true} />
            {stageId === productionStageId &&
            action['@type'] === 'CreateReleaseAction'
              ? 'Production release'
              : API_LABELS[action['@type']]}
            {/*<Iconoclass iconName="delete" onClick={onClose} behavior="button" />*/}
            <span />
          </header>

          {/* Metadata */}
          <section className={bem`__section`}>
            <h3 className={bem`__section-title`}>Metadata</h3>
            <LayoutWrapRows>
              <LayoutWrapItem flexBasis="150px">
                <ControlledPaperInput
                  label="Name"
                  name="name"
                  type="text"
                  value={action.name || ''}
                  disabled={disabled}
                  onSubmit={this.handleChange}
                />
              </LayoutWrapItem>
              <LayoutWrapItem flexBasis="150px">
                <ControlledPaperInput
                  label={`Expected duration (days)`}
                  name="expectedDuration"
                  type="number"
                  disabled={disabled}
                  min={1}
                  step={1}
                  value={moment
                    .duration(action.expectedDuration || 'P1D')
                    .asDays()
                    .toString()}
                  onSubmit={this.handleChange}
                />
              </LayoutWrapItem>
              <LayoutWrapItem flexBasis="100%">
                <ControlledPaperTextarea
                  label="Description"
                  name="description"
                  disabled={disabled}
                  value={action.description || ''}
                  onSubmit={this.handleChange}
                />
              </LayoutWrapItem>
            </LayoutWrapRows>
          </section>

          {/* Agent */}
          {agent &&
            agent.roleName !== 'author' &&
            agent.roleName !== 'reviewer' && (
              <section className={bem`__section`}>
                <h3 className={bem`__section-title`}>Agent</h3>

                <CreateGraphActionEditorAgentEditor
                  disabled={disabled}
                  periodical={periodical}
                  onChange={onChange}
                  action={action}
                  nodeMap={nodeMap}
                />
              </section>
            )}

          {/* Audience */}
          <section className={bem`__section`}>
            <h3 className={bem`__section-title`}>Audience & participants</h3>
            <CreateGraphActionEditorAudienceEditor
              disabled={disabled}
              onChange={onChange}
              action={action}
              stageId={stageId}
              nodeMap={nodeMap}
            />
          </section>

          {/* Endorser */}
          {/* We don't support endorse for action that can lead to mutable content (as the selectors are not stable in that case as user can add / remove elements) */}
          <section className={bem`__section`}>
            <h3 className={bem`__section-title`}>Endorser</h3>
            <CreateGraphActionEditorEndorserEditor
              disabled={disabled}
              periodical={periodical}
              onChange={onChange}
              action={action}
              stageId={stageId}
              nodeMap={nodeMap}
            />
          </section>

          {/* Number of instances */}
          {action['@type'] === 'ReviewAction' && (
            <section className={bem`__section`}>
              <h3 className={bem`__section-title`}>Number of reviewers</h3>
              <CreateGraphActionEditorInstanceEditor
                disabled={disabled}
                onChange={onChange}
                action={action}
                nodeMap={nodeMap}
              />
            </section>
          )}

          {/* Questions  */}
          {(action['@type'] === 'ReviewAction' ||
            action['@type'] === 'DeclareAction') && (
            <section className={bem`__section`}>
              <h3 className={bem`__section-title`}>Questions</h3>
              <CreateGraphActionEditorQuestionEditor
                disabled={disabled}
                onChange={onChange}
                action={action}
                nodeMap={nodeMap}
              />
            </section>
          )}

          {/* Content requirements */}
          {action['@type'] === 'CreateReleaseAction' && (
            <section className={bem`__section`}>
              <h3 className={bem`__section-title`}>Content requirements</h3>
              <CreateGraphActionEditorContentRequirementEditor
                stageId={stageId}
                productionStageId={productionStageId}
                disabled={disabled}
                onChange={onChange}
                action={action}
                nodeMap={nodeMap}
              />
            </section>
          )}

          {/* Author Services  */}
          {action['@type'] === 'CreateReleaseAction' &&
            !!createReleaseActionPotentialServices.length && (
              <section className={bem`__section`}>
                <h3 className={bem`__section-title`}>Author services</h3>
                <CreateGraphActionEditorServiceEditor
                  disabled={disabled}
                  onChange={onChange}
                  action={action}
                  nodeMap={nodeMap}
                  potentialServices={createReleaseActionPotentialServices}
                  serviceProp="potentialService"
                />
              </section>
            )}

          {/* AddOn services */}
          {action['@type'] === 'PublishAction' &&
            !!publishActionAddOnServices.length && (
              <section className={bem`__section`}>
                <h3 className={bem`__section-title`}>Add on services</h3>
                <CreateGraphActionEditorServiceEditor
                  disabled={disabled}
                  onChange={onChange}
                  action={action}
                  nodeMap={nodeMap}
                  potentialServices={publishActionAddOnServices}
                  serviceProp="addOnService"
                />
              </section>
            )}

          {/* APC  */}
          {action['@type'] === 'PayAction' && (
            <section className={bem`__section`}>
              <h3 className={bem`__section-title`}>
                Article Processing Charges
              </h3>

              <CreateGraphActionEditorApcEditor
                disabled={disabled}
                onChange={onChange}
                action={action}
                nodeMap={nodeMap}
              />
            </section>
          )}

          <ControlPanel>
            <PaperButton onClick={onClose}>close</PaperButton>
          </ControlPanel>
        </div>
      </Card>
    );
  }
}

export const StyleFormGroup = ({ children, tagName }) => {
  const bem = BemTags('create-graph-action-editor-modal');
  const El = tagName || 'div';
  return <El className={bem`__form-group`}>{children}</El>;
};

StyleFormGroup.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};

export const StyleFormGroupTitle = ({ children, tagName }) => {
  const bem = BemTags('create-graph-action-editor-modal');
  const El = tagName || 'div';
  return <El className={bem`__form-group-title`}>{children}</El>;
};

StyleFormGroupTitle.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};

export const StyleJustifiedRow = ({ children, tagName }) => {
  const bem = BemTags('create-graph-action-editor-modal');
  const El = tagName || 'div';
  return <El className={bem`__justified-row`}>{children}</El>;
};

StyleJustifiedRow.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};

export const StyleJustifiedRowGroup = ({ children, tagName }) => {
  const bem = BemTags('create-graph-action-editor-modal');
  const El = tagName || 'div';
  return <El className={bem`__justified-row-group`}>{children}</El>;
};

StyleJustifiedRowGroup.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};
