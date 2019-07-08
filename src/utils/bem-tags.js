/*
  nameOfClass = create new base stub from nameSpace: nameSpace__nameOfClass
  nameOfClass__ = add new stub to stem: nameSpace_nameOfClass__
  __nameOfSubClass = chain sub name to classStem: nameSpace__nameOfClass__nameOfSubClass
  --modifier = add modifier class to stem: nameSpace__nameOfClass nameSpace__nameOfClass--modifier

  simple Example:
  bem = reactBEM('nameSpace');
  ...
  bem`component __child --modifier'
  will create the classes:
  nameSpace__component__child
  nameSpace__component__chold-modifier'

  Advanced Example
  bem`component __newStub__ __subChild --modifier __sibling newParent`
  result:
  nameSpace__component__newStub__subChild
  nameSpace__component__newStub__subChild--modifier
  nameSpace__component__newStub__sibling
  nameSpace__newParent
*/

export default function BemTags() {
  let nameSpaces = Array.from(arguments);

  /*
  make sure there is at least one non-mixin namespace initialized - this is because the top-level namespace can be declared later, on first bem call
  */
  if (
    nameSpaces.filter(nameSpace => {
      let result = nameSpace == null || nameSpace.indexOf('@') !== 0;
      return result;
    }).length === 0
  ) {
    nameSpaces.push(null);
  }

  let BemTagSpaces = nameSpaces.map((nameSpace, i) => {
    let isMixin = false;
    if (nameSpace && nameSpace.indexOf('@') === 0 && nameSpace.length > 2) {
      isMixin = true;
      nameSpace = nameSpace.substring(1);
    }
    return new BemTagsParser(nameSpace, isMixin);
  });

  return function(parts, ...values) {
    let resultArr = [];
    BemTagSpaces.forEach(parseTagsInst => {
      let result = parseTagsInst.parse(parts, values);
      if (result) resultArr.push(result);
    });
    //console.log('resultArr', resultArr);
    return resultArr.join(' ').trim();
  };
}

export class BemTagsParser {
  constructor(ns, isMixin) {
    //console.log('new constructor', ns, isMixin);
    this.classStem = null;
    this.modifierStem = null;
    this.rootClass = ns;
    this.isMixinNs = isMixin;
    if (ns) {
      this.classStem = ns.trim();
      this.modifierStem = ns.trim();
    }
  }

  parse(parts, values) {
    //console.log('parse', 'parts: ' + parts, 'values: ' + values);
    //console.log('c parts: ', parts, values);
    //console.log('rootClass', this.rootClass);

    let interArr = [];

    parts.forEach((part, i) => {
      interArr.push(part);
      if (values[i]) interArr.push(values[i]);
    });

    let flatStr = interArr.join('');

    // remove any line-breaks
    flatStr = flatStr.replace(/(\r\n|\n|\r)/gm, '');

    let flatArr = flatStr.split(' ');
    //console.log('flatArr:', flatArr);

    // bem classes
    let classes = '';

    // any additional, parallel classes added using '+'
    let extraClasses = '';

    flatArr.forEach(block => {
      //console.log('block', block);
      let subClass = false;
      let modifier = false;
      let newStub = false;
      let extraClass = false;
      let mixinBlock = false;

      if (block && block !== '') {
        let subName = block.trim();
        if (subName.indexOf('@') === 0 && subName.length > 1) {
          // this is mixin block
          mixinBlock = true;
          subName = subName.substring(1);
        }
        if (subName.indexOf('__') === 0 && subName.length > 2) {
          // sub classes
          subClass = true;
          subName = subName.substring(2);
        } else if (subName.indexOf('--') === 0 && subName.length > 2) {
          // modifiers
          subName = subName.substring(2);
          modifier = true;
          // console.log('--not subClass');
        } else if (
          mixinBlock &&
          this.isMixinNs &&
          subName.indexOf(this.rootClass) !== 0
        ) {
          // this is mixinBlock and a mixin parser instance and we must be working on a named mixin (e.g. @mixin-name__)
          // but the mixin names don't match - exit.
          return;
        } else if (mixinBlock) {
          // this must be a named mixin - extract the subname
          if (subName.indexOf('__') > 0) {
            subName = subName.substring(subName.indexOf('__') + 2);
          } else {
            return;
          }
        }

        if (this.isMixinNs && !mixinBlock) {
          // if this is a mixin namespace, but we are not parsing a mixinBlock, exit
          return;
        }

        if (
          subName.lastIndexOf('__') !== -1 &&
          subName.lastIndexOf('__') === subName.length - 2
        ) {
          // stub glue
          subName = subName.substring(0, subName.lastIndexOf('__'));
          newStub = true;
        }

        if (
          (this.rootClass == undefined ||
            this.rootClass == null ||
            this.rootClass === block) &&
          !subClass &&
          !modifier
        ) {
          // no rootClass is set so make this the root

          this.rootClass = block;
          this.classStem = this.rootClass;
          this.modifierStem = this.classStem;
          classes = this.classStem;
          return classes;
        } else if (this.rootClass == null) {
          // otherwise we must be in a null namespace and this parsing does not provide a rootclass
          return '';
        }
        if (!(modifier || subClass || extraClass)) {
          // reset to root
          this.classStem = this.rootClass;
          subClass = true;
          // console.log('--reset root');
        }
        //console.log('subName: ', subName, this.classStem);
        if (subClass) {
          classes = `${classes} ${this.classStem}__${subName}`;
          this.modifierStem = `${this.classStem}__${subName}`;
          //console.log('building subclass: ', classes);
        } else if (modifier && classes === '') {
          // special case where there is a modifier with no sub class
          classes = `${this.classStem} ${this.classStem}--${subName}`;
        } else if (modifier) {
          // modifier
          classes = `${classes} ${this.modifierStem}--${subName}`;
          //console.log('building mod: ', classes);
        }

        if (
          newStub &&
          (this.classStem.lastIndexOf(subName) === -1 ||
            !(
              this.classStem.lastIndexOf(subName) ===
              this.classStem.length - subName.length
            ))
        ) {
          // make new stub as long as it's not a repeat of current stub
          let spacer = modifier ? '--' : '__';
          this.classStem = `${this.classStem}${spacer}${subName}`;
          this.modifierStem = this.classStem;
          //console.log('new classStem:', this.classStem);
        }
      }
    });

    //console.log('result for ' + this.rootClass, `${classes} ${extraClasses}`);

    return `${classes} ${extraClasses}`.trim();
  }
}
