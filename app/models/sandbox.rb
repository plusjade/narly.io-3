module Sandbox
  Path = '/Users/jade/dropbox/active/git-tutorials/'

  # TODO: Security logic to disallow directory traversal. =P
  def self.get_repo_path(name)
    File.join(Path, name)
  end
end
