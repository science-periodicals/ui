import React, { Component } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { createId } from '@scipe/librarian';
import { getId, arrayify, getValue, embed } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import PaperTextarea from '../paper-textarea';
import PaperSelect from '../paper-select';
import { StyleFormGroup } from './create-graph-action-editor-modal';
import withOnSubmit from '../../hoc/with-on-submit';
import BemTags from '../../utils/bem-tags';

const ControledPaperTextarea = withOnSubmit(PaperTextarea);

export default class CreateGraphActionEditorQuestionEditor extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    action: PropTypes.object,
    nodeMap: PropTypes.object,
    onChange: PropTypes.func,
    roleName: PropTypes.string
  };

  static defaultProps = {
    action: {},
    nodeMap: {},
    onChange: noop
  };

  handleChange(question, e) {
    const questionId = getId(question);
    const { onChange, nodeMap } = this.props;

    if (e.target.name === 'answer') {
      const question = nodeMap[questionId];
      if (question) {
        if (e.target.value === 'text') {
          if (question.suggestedAnswer) {
            onChange(
              Object.assign({}, nodeMap, {
                [questionId]: omit(question, ['suggestedAnswer'])
              })
            );
          }
        } else if (e.target.value === 'boolean') {
          const yes = {
            '@id': createId('blank')['@id'],
            '@type': 'Answer',
            text: 'yes'
          };
          const no = {
            '@id': createId('blank')['@id'],
            '@type': 'Answer',
            text: 'no'
          };
          onChange(
            Object.assign({}, nodeMap, {
              [questionId]: Object.assign({}, question, {
                suggestedAnswer: [getId(yes), getId(no)]
              }),
              [getId(yes)]: yes,
              [getId(no)]: no
            })
          );
        }
      }
    } else if (e.target.name === 'text') {
      onChange(
        Object.assign({}, nodeMap, {
          [questionId]: Object.assign({}, nodeMap[questionId], {
            [e.target.name]: e.target.value
          })
        })
      );
    }
  }

  handleAdd = e => {
    const { action, nodeMap, onChange } = this.props;

    const nextQuestion = {
      '@id': createId('blank')['@id'],
      '@type': 'Question'
    };

    if (action['@type'] === 'ReviewAction') {
      const nextAnswer = {
        '@id': createId('blank')['@id'],
        '@type': 'Answer',
        parentItem: getId(nextQuestion)
      };

      const nextAction = Object.assign({}, action, {
        answer: arrayify(action.answer).concat(getId(nextAnswer))
      });
      onChange(
        Object.assign({}, nodeMap, {
          [getId(nextAction)]: nextAction,
          [getId(nextAnswer)]: nextAnswer,
          [getId(nextQuestion)]: nextQuestion
        })
      );
    } else {
      const nextAction = Object.assign({}, action, {
        question: arrayify(action.question).concat(getId(nextQuestion))
      });
      onChange(
        Object.assign({}, nodeMap, {
          [getId(nextAction)]: nextAction,
          [getId(nextQuestion)]: nextQuestion
        })
      );
    }
  };

  handleDelete(question, e) {
    const { action, nodeMap, onChange } = this.props;
    if (action['@type'] === 'ReviewAction') {
      const nextAction = Object.assign({}, action, {
        answer: arrayify(action.answer).filter(answerId => {
          const answer = nodeMap[getId(answerId)];
          return !answer || getId(answer.parentItem) !== getId(question);
        })
      });
      if (!nextAction.answer.length) {
        delete nextAction.answer;
      }
      onChange(
        Object.assign(omit(nodeMap), {
          [getId(action)]: nextAction
        })
      );
    } else {
      const nextAction = Object.assign({}, action, {
        question: arrayify(action.question).filter(
          _question => getId(_question) !== getId(question)
        )
      });
      if (!nextAction.question.length) {
        delete nextAction.question;
      }

      onChange(
        Object.assign(omit(nodeMap), {
          [getId(action)]: nextAction
        })
      );
    }
  }

  render() {
    const { disabled, action, nodeMap } = this.props;

    const bem = BemTags();

    let questions;
    if (action['@type'] === 'ReviewAction') {
      questions = arrayify(action.answer)
        .map(answerId => {
          const answer = embed(getId(answerId), nodeMap);
          if (
            answer &&
            answer.parentItem &&
            answer.parentItem['@type'] === 'Question'
          ) {
            return answer.parentItem;
          } else {
            return answer;
          }
        })
        .filter(Boolean);
    } else {
      questions = arrayify(action.question)
        .map(questionId => {
          return embed(getId(questionId), nodeMap);
        })
        .filter(Boolean);
    }

    return (
      <StyleFormGroup>
        <fieldset className={bem`create-graph-action-editor-modal`}>
          <ul className={bem`__question-list`}>
            {questions.map(question => (
              <li key={getId(question)} className={bem`__question`}>
                <div className={bem`__question-controls`}>
                  <Iconoclass
                    iconName="delete"
                    elementType="button"
                    disabled={disabled}
                    onClick={this.handleDelete.bind(this, question)}
                    size="18px"
                  />
                </div>
                <div className={bem`__question-inputs`}>
                  <div className={bem`__question-input`}>
                    <ControledPaperTextarea
                      name="text"
                      label="question"
                      disabled={disabled}
                      value={getValue(question.text) || ''}
                      onSubmit={this.handleChange.bind(this, question)}
                    />
                  </div>
                  <div className={bem`__question-input`}>
                    <PaperSelect
                      name="answer"
                      label="answer"
                      disabled={disabled}
                      value={isBoolean(question) ? 'boolean' : 'text'}
                      onChange={this.handleChange.bind(this, question)}
                    >
                      <option value="boolean">yes / no</option>
                      <option value="text">text</option>
                    </PaperSelect>
                  </div>
                </div>
              </li>
            ))}

            <li className={bem`__question-list-controls`}>
              <Iconoclass
                disabled={disabled}
                iconName="add"
                elementType="button"
                onClick={this.handleAdd}
              />
            </li>
          </ul>
        </fieldset>
      </StyleFormGroup>
    );
  }
}

function isBoolean(question, nodeMap) {
  const answers = arrayify(question.suggestedAnswer);
  return (
    answers.length === 2 &&
    answers.every(answer => {
      const text = getValue(answer.text);
      return text && /^yes$|^no$/i.test(text.trim());
    })
  );
}
