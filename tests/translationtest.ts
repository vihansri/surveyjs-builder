import * as ko from "knockout";
import * as Survey from "survey-knockout";
import {
  TranslationGroup,
  TranslationItem,
  Translation
} from "../src/translation";
import { equal } from "assert";

export default QUnit.module("TranslatonTests");

QUnit.test("Text question localization properties", function(assert) {
  var question = new Survey.QuestionText("q1");
  var group = new TranslationGroup(question.name, question);
  assert.ok(
    group.items.length >= 5,
    "There are five or more localization strings"
  );
});
QUnit.test("Text question choices localization", function(assert) {
  var question = new Survey.QuestionCheckbox("q1");
  question.choices = ["item1", { value: "item2", text: "text 2" }];
  var group = new TranslationGroup(question.name, question);
  var choices: TranslationGroup = null;
  for (var i = 0; i < group.groups.length; i++) {
    if (group.groups[i].name == "choices") {
      choices = group.groups[i];
      break;
    }
  }
  assert.ok(choices, "choices has been created as group");
  assert.equal(choices.items.length, 2, "There are two items");
  assert.equal(
    choices.items[0].name,
    "item1",
    "Value is set correctly for item 1"
  );
  assert.equal(
    choices.items[1].name,
    "item2",
    "Value is set correctly for item 2"
  );
});
QUnit.test("Survey child groups", function(assert) {
  var survey = new Survey.Survey();
  var group = new TranslationGroup("root", survey);
  assert.equal(group.groups.length, 0, "There is no any group yet");
  survey.addNewPage("p1");
  group.reset();
  assert.equal(group.groups.length, 1, "one page is added");
  assert.equal(group.groups[0].groups.length, 0, "no questions");
  survey.pages[0].addNewQuestion("text", "q1");
  group.reset();
  assert.equal(group.groups.length, 1, "questions should not be there");
  assert.equal(group.groups[0].groups.length, 1, "page has one question");
});
QUnit.test("Survey child groups", function(assert) {
  var survey = new Survey.Survey();
  var group = new TranslationGroup("root", survey);
  survey.addNewPage("p1");
  var question = <Survey.QuestionText>(
    survey.pages[0].addNewQuestion("text", "q1")
  );
  var translation = new Translation(survey, true);
  assert.equal(translation.locales.length, 1, "There is only default locale");
  question.locTitle.setLocaleText("de", "Deutch text");
  translation.reset();
  assert.equal(translation.locales.length, 2, "There are two locales now");
  translation.addLocale("fr");
  translation.addLocale("de");
  assert.equal(translation.locales.length, 3, "There are three locales now");
  translation.reset();
  assert.equal(translation.locales.length, 2, "There are two locales again");
  survey.title = "test";
  translation.reset();
  assert.equal(translation.locales.length, 2, "There are two locales again-2");
});
QUnit.test("get locales", function(assert) {
  var survey = new Survey.Survey({
    title: { default: "t1", de: "dfdfdf" },
    description: "text1"
  });
  var translation = new Translation(survey, true);
  assert.equal(
    translation.locales.length,
    2,
    "There are two locales only, 'default'/empty and 'de'"
  );
});
QUnit.test("Localization strings editing", function(assert) {
  var question = new Survey.QuestionText("q1");
  var group = new TranslationGroup(question.name, question);
  var item = <TranslationItem>group.items[0];
  question[item.name] = "textEn";
  var valEnglish = item.koValue("");
  var valFrench = item.koValue("fr");
  assert.equal(valEnglish(), "textEn", "The value was set");
  assert.equal(valFrench(), "", "The value was not set");
  valEnglish("textEnUpdated");
  valFrench("textFranceNew");
  assert.equal(
    question[item.name],
    "textEnUpdated",
    "The english value has been updated"
  );
  assert.equal(
    item.locString.getLocaleText("fr"),
    "textFranceNew",
    "The french value has been updated"
  );
});
QUnit.test("Translation for adding", function(assert) {
  var translation = new Translation(new Survey.Survey(), true);
  var locales = Survey.surveyLocalization.locales;
  var count = 0;
  for (var key in locales) count++;
  assert.equal(
    translation.koAvailableLanguages().length,
    count - 1,
    "All locales - 1"
  );
  translation.addLocale("de");
  assert.equal(
    translation.koAvailableLanguages().length,
    count - 2,
    "All locales - 2"
  );
  assert.equal(translation.locales.length, 2, "There are two locales");
  assert.equal(
    translation.koSelectedLanguageToAdd(),
    null,
    "No language selected"
  );
  translation.koSelectedLanguageToAdd({ value: "fr", text: "French" });
  assert.equal(translation.locales.length, 3, "There are three locales");
  assert.equal(translation.locales[2], "fr", "The last added locale is 'fr'");
  assert.equal(
    translation.koSelectedLanguageToAdd(),
    null,
    "No language selected again"
  );
});
QUnit.test("Translation show All strings", function(assert) {
  var survey = new Survey.Survey();
  survey.completedHtml = "Test";
  survey.addNewPage("page1");
  survey.pages[0].addNewQuestion("checkbox", "question1");
  var translation = new Translation(survey);
  assert.equal(
    translation.root.locItems.length,
    1,
    "There is one item to translate - completedHtml"
  );
  assert.equal(translation.root.groups.length, 1, "There is one group - page");
  var pageGroup = translation.root.groups[0];
  assert.equal(pageGroup.groups.length, 1, "There is one group - question");
  assert.equal(pageGroup.locItems.length, 1, "There is one item - title");
  var questionGroup = pageGroup.groups[0];
  assert.equal(questionGroup.groups.length, 1, "There is one group - choices");
  assert.equal(questionGroup.locItems.length, 1, "There is one item - title");
});
