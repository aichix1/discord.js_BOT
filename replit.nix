{ pkgs }: {
  deps = [
		pkgs.htop
		pkgs.git
		pkgs.gh
		pkgs.nodejs_20
		pkgs.python311Full
		pkgs.yarn
		pkgs.replitPackages.stderred
		pkgs.p7zip
		pkgs.libsndfile
		pkgs.vim
		pkgs.tesseract
	];
	env = {
		LANG = "en_US.UTF-8";
	};
}