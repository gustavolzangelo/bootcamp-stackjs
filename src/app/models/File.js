import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `htttp://localhost:3333/files/${this.name}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default File;
