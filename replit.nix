{ pkgs }: {
  deps = [
		pkgs.htop
		pkgs.git
		pkgs.gh
		pkgs.nodejs_20
		pkgs.python311Full
		pkgs.replitPackages.stderred
		pkgs.libsndfile
	];
	env = {
		LANG = "en_US.UTF-8";
	};
}