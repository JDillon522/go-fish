SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `go_fish` ;
CREATE SCHEMA IF NOT EXISTS `go_fish` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `go_fish` ;

-- -----------------------------------------------------
-- Table `go_fish`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `go_fish`.`users` ;

CREATE  TABLE IF NOT EXISTS `go_fish`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `username` VARCHAR(255) NULL ,
  `email` VARCHAR(255) NULL ,
  `hash` VARCHAR(255) NULL ,
  `created_at` DATETIME NULL ,
  `updated_at` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `go_fish`.`profiles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `go_fish`.`profiles` ;

CREATE  TABLE IF NOT EXISTS `go_fish`.`profiles` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `user_id` INT NOT NULL ,
  `wins` INT NULL ,
  `losses` INT NULL ,
  `ties` INT NULL ,
  `created_at` DATETIME NULL ,
  `updated_at` DATETIME NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_profiles_users_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_profiles_users`
    FOREIGN KEY (`user_id` )
    REFERENCES `go_fish`.`users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `go_fish` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
