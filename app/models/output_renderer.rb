module OutputRenderer
  class HTMLRenderer < Redcarpet::Render::HTML
    def block_code(code, language)

      "<pre class=\"terminal-wrap\"><span class=\"commands #{ language }\">#{ language } Terminal</span>" +
      "<code class=\"#{ language }\">#{ code }</code></pre>\n"
    end
  end

  # TODO: Sanitize
  def self.diff(lines)
    ApplicationController.new.render_to_string(partial: "templates/diff", locals: { lines: lines }, formats: [:html]).html_safe
  end

  def self.markdown(content)
    Redcarpet::Markdown.new(HTMLRenderer.new,
      safe_links_only: true,
      filter_html: true,
      autolink: true,
      fenced_code_blocks: true,
    ).render(content)
  end

  # Public interface for building 'clean slugs'
  # Redefine this method to implement custom slug generation.
  def self.clean_slug(string)
    hyphenate(string)
  end

  def self.clean_slug_and_escape(string)
    CGI::escape(clean_slug(string))
  end

  # Simple url slug normalization.
  # Converts all non word characters into hyphens.
  # This may not be what you want so feel free to overwite the public
  # method in place of another formatter.
  #
  # Ex: My Post Title ===> my-post-title
  def self.hyphenate(string)
    string = string.to_s.downcase.strip.gsub(/[^\p{Word}+]/u, '-')
    string.gsub(/^\-+/, '').gsub(/\-+$/, '').gsub(/\-+/, '-')
  end
end
