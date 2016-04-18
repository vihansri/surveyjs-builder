﻿/// <reference path="objectPropertyItemValues.ts" />
/// <reference path="objectPropertyTriggers.ts" />
/// <reference path="objectPropertyValidators.ts" />
/// <reference path="objectPropertyTextItems.ts" />
/// <reference path="objectPropertyMatrixDropdownColumns.ts" />

module SurveyEditor {

    declare type SurveyOnPropertyChangedCallback = (property: SurveyObjectProperty, newValue: any) => void;

    export class SurveyObjectProperty {
        private objectValue: any;
        private isValueUpdating: boolean;
        public name: string;
        public koValue: any;
        public koText: any;
        public arrayEditor: SurveyPropertyArray;
        public modalName: string; 
        public modalNameTarget: string;
        public koIsDefault: any;
        public editorType: string;
        public baseEditorType: string;
        public choices: Array<any>;

        constructor(public property: Survey.JsonObjectProperty, onPropertyChanged: SurveyOnPropertyChangedCallback = null) {
            this.name = this.property.name;
            this.koValue = ko.observable();
            this.editorType = property.type;
            this.choices = property.choices;
            if (this.choices != null) {
                this.editorType = "dropdown";
            }
            var self = this;
            this.arrayEditor = null;
            var onItemChanged = function (newValue: any) { self.koValue(newValue); };
            this.modalName = "modelEditor" + this.editorType + this.name;
            this.modalNameTarget = "#" + this.modalName;
            if (this.editorType == "itemvalues") {
                this.arrayEditor = new SurveyPropertyItemValues((newValue: any) => { onItemChanged(newValue); });
            }
            if (this.editorType == "triggers") {
                this.arrayEditor = new SurveyPropertyTriggers((newValue: any) => { onItemChanged(newValue); });
            }
            if (this.editorType == "validators") {
                this.arrayEditor = new SurveyPropertyValidators((newValue: any) => { onItemChanged(newValue); });
            }
            if (this.editorType == "textitems") {
                this.arrayEditor = new SurveyPropertyTextItems((newValue: any) => { onItemChanged(newValue); });
            }
            if (this.editorType == "matrixdropdowncolumns") {
                this.arrayEditor = new SurveyPropertyMatrixDropdownColumns((newValue: any) => { onItemChanged(newValue); });
            }
            this.baseEditorType = this.arrayEditor != null ? "array" : this.editorType;
            this.koValue.subscribe(function (newValue) {
                if (self.object == null) return;
                if (self.object[self.name] == newValue) return;
                if (onPropertyChanged != null && !self.isValueUpdating) onPropertyChanged(self, newValue);
            });
            this.koText = ko.computed(() => { return self.getValueText(self.koValue()); });
            this.koIsDefault = ko.computed(function () { return self.property.isDefaultValue(self.koValue()); }); 
        }
        public get object(): any { return this.objectValue; }
        public set object(value: any) {
            this.objectValue = value;
            this.updateValue();
        }
        protected updateValue() {
            this.isValueUpdating = true;
            this.koValue(this.getValue());
            if (this.arrayEditor) {
                this.arrayEditor.object = this.object;
                this.arrayEditor.title("Edit property '" + this.property.name + "'");
                this.arrayEditor.value = this.koValue();
            }
            this.isValueUpdating = false;
        }
        protected getValue(): any {
            if (this.property.hasToUseGetValue) return this.property.getValue(this.object);
            return this.object[this.name];
        }
        protected getValueText(value: any): string {
            if (value != null && Array.isArray(value)) {
                return "[ Items: "+ value.length + " ]";
            }
            return value;
        }
    }
}