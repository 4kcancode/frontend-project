import { LabelStudio, Tooltip } from '@heartexlabs/ls-test/helpers/LSF/index';
import { useTaxonomy } from '@heartexlabs/ls-test/helpers/LSF';
import {
  dataWithPrediction,
  dynamicData,
  dynamicTaxonomyConfig,
  simpleData,
  taxonomyConfig,
  taxonomyConfigWithMaxUsages,
  taxonomyResultWithAlias
} from '../../data/control_tags/taxonomy';
import {
  FF_DEV_2007,
  FF_DEV_2007_DEV_2008,
  FF_DEV_2100_A,
  FF_DEV_3617,
  FF_TAXONOMY_ASYNC,
  FF_TAXONOMY_LABELING
} from '../../../../src/utils/feature-flags';

beforeEach(() => {
  LabelStudio.addFeatureFlagsOnPageLoad({
    [FF_DEV_2007]: true, // rework choices
    [FF_DEV_2007_DEV_2008]: true, // dynamic choices
    [FF_DEV_2100_A]: true, // preselected choices
  });
});

const init = (config, data) => {
  LabelStudio.params()
    .config(config)
    .data(data)
    .withResult([])
    .init();
};

const taxonomies = {
  'Old Taxonomy': useTaxonomy('&:eq(0)'),
  'New Taxonomy': useTaxonomy('&:eq(0)', true),
};

Object.entries(taxonomies).forEach(([title, Taxonomy]) => {
  describe('Control Tags - ' + title, () => {
    beforeEach(() => {
      if (Taxonomy.isNew) {
        LabelStudio.addFeatureFlagsOnPageLoad({
          [FF_TAXONOMY_ASYNC]: true,
          [FF_TAXONOMY_LABELING]: true,
        });
      }
    });

    it('should show hint for <Choice />', () => {
      init(taxonomyConfig, simpleData);

      Taxonomy.open();
      Taxonomy.findItem('Choice 2').trigger('mouseenter');
      Tooltip.hasText('A hint for Choice 2');
      Taxonomy.hasNoSelected('Choice 3');
    });

    it('should use aliases everywhere if given', () => {
      LabelStudio.params()
        .config(taxonomyConfig)
        .data(simpleData)
        .withResult([taxonomyResultWithAlias])
        .init();

      Taxonomy.hasSelected('Choice 2');
      Taxonomy.open();
      Taxonomy.findItem('Choice 2').click();
      Taxonomy.findItem('Choice 1').click();
      Taxonomy.hasSelected('Choice 1');
      Taxonomy.hasNoSelected('Choice 2');

      LabelStudio.serialize().then(result => {
        expect(result.length).to.be.eq(1);
        expect(result[0].value.taxonomy).to.be.eql([['C1']]);
      });
    });

    // @todo check real Taxonomy actions, not just a submit action
    it('should show error message if there are more choices selected than maxUsages is set', () => {
      LabelStudio.init({
        config: taxonomyConfigWithMaxUsages,
        task: dataWithPrediction,
      });

      cy.contains('button', 'Update').click();

      cy.contains('The number of options selected (2) exceed the maximum allowed (1). To proceed, first unselect excess options for: • Taxonomy (taxonomy)').should('exist');
    });

    it('should not show error message if choices selected is equal to maxUsages', () => {
      LabelStudio.params()
        .config(taxonomyConfigWithMaxUsages)
        .data(simpleData)
        .withResult([
          {
            'id': 'n2ldmNpSQI',
            'type': 'taxonomy',
            'value': {
              'taxonomy': [
                [
                  'Bacteria',
                ],
              ],
            },
            'origin': 'manual',
            'to_name': 'text',
            'from_name': 'taxonomy',
          },
        ])
        .init();

      cy.contains('button', 'Update').click();

      cy.contains('The number of options selected (2) exceed the maximum allowed (1). To proceed, first unselect excess options for: • Taxonomy (taxonomy)').should('not.exist');
    });
  });

  describe('Control Tags - Taxonomy with preselected Choices', () => {
    const FF_DEV_3617_STATES = [true, false];
    const datasets = [
      { title: 'static', config: taxonomyConfig, data: simpleData },
      { title: 'dynamic', config: dynamicTaxonomyConfig, data: dynamicData },
    ];
  
    for (const ffState of FF_DEV_3617_STATES) {
      for (const { config, data, title } of datasets) {
        it(`should work with FF_DEV_3617 ${ffState ? 'on' : 'off'} for ${title} dataset`, () => {
          LabelStudio.addFeatureFlagsOnPageLoad({
            [FF_DEV_3617]: ffState,
          });
  
          init(config, data);
          cy.get('.lsf-annotations-list').click();
          cy.get('.lsf-annotations-list__create').click();
          Taxonomy.open();
          Taxonomy.hasSelected('Choice 3');
        });
      }
    }
  });
});
