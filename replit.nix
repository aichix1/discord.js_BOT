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
		#pkgs.replitPackages.prybar-python310
		#pkgs.nodePackages.typescript-language-server
		#pkgs.replitPackages.jest
  ];
  env = {
    #PYTHON_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
    #  pkgs.stdenv.cc.cc.lib
    #  pkgs.zlib
    #  pkgs.glib
    #  pkgs.xorg.libX11
    #];
    #PYTHONHOME = "${pkgs.python310Full}";
    #PYTHONBIN = "${pkgs.python310Full}/bin/python3.10";
    LANG = "en_US.UTF-8";
    #STDERREDBIN = "${pkgs.replitPackages.stderred}/bin/stderred";
    #PRYBAR_PYTHON_BIN = "${pkgs.replitPackages.prybar-python310}/bin/prybar-python310";
  };
}