module common.data {

  export class Randy<T> {



    getBool(probTrue: number, probNull?: number): Boolean {
      if (probNull && this.getBool(probNull)) return null;
      if (probTrue === 0) return false;
      if (probTrue === 1) return true;
      probTrue = probTrue || 0.5;
      return Math.random() <= probTrue;
    }


    getInt(minCount: number, maxCount: number, probNull?: number): number {
      if (this.getBool(probNull || 0)) return null;
      return Math.floor(minCount + ((maxCount - minCount) * Math.random()));
    }

    getFloat(minCount: number, maxCount: number, probNull?: number): number {
      if (this.getBool(probNull || 0)) return null;
      return minCount + ((maxCount - minCount) * Math.random());
    }

    getUUID(probNull?: number): string {
      if (this.getBool(probNull || 0)) return null;
      return uuid.v4();
    }





    getList(minCount: number, maxCount: number, probNull: number, fn: (number?) => T): Array<T> {
      if (this.getBool(probNull || 0)) return null;
      var count = this.getInt(minCount, maxCount),
        list = [],
        i;
      for (i = 0; i < count; i++) {
        list.push(fn(i));
      }
      return list;
    }



    getWords(minCount: number, maxCount: number, probNull?: number): string {
      if (this.getBool(probNull || 0)) return null;
      return String(faker.lorem.words(this.getInt(minCount, maxCount))).replace(/\,/g, ' ');
    }


    getTitle(minChars?: number, maxChars?: number, probNull?: number): string {
      if (this.getBool(probNull || 0)) return null;
      if (minChars === undefined) minChars = 3;
      if (maxChars === undefined) maxChars = 70;
      var chars = this.getInt(minChars, maxChars);
      // get more than needed
      var text = this.getWords(chars * 3, chars * 3);
      if (text.length > chars) {
        text = text.substr(0, chars);
      }
      return text;
    }



    getDescription(minChars?: number, maxChars?: number, probNull?: number): string {
      if (this.getBool(probNull || 0)) return null;
      if (minChars === undefined) minChars = 12;
      if (maxChars === undefined) maxChars = 500;
      var chars = this.getInt(minChars, maxChars);
      // get more than needed
      var text = this.getWords(chars * 3, chars * 3);
      if (text.length > chars) {
        text = text.substr(0, chars);
      }
      return text;
    }




  }

}
